import React, { useEffect, useMemo, useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router';
import { mdiCloseCircleOutline, mdiEyeOutline, mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { debounce } from 'lodash';
import { useDebounceValue } from 'usehooks-ts';

import EpisodeSearchAndFilterPanel from '@/components/Collection/Episode/EpisodeSearchAndFilterPanel';
import EpisodeSummary from '@/components/Collection/Episode/EpisodeSummary';
import EpisodeWatchModal from '@/components/Collection/Episode/EpisodeWatchModal';
import Button from '@/components/Input/Button';
import { useWatchSeriesEpisodesMutation } from '@/core/react-query/series/mutations';
import { useSeriesEpisodesInfiniteQuery } from '@/core/react-query/series/queries';
import { IncludeOnlyFilterEnum } from '@/core/react-query/series/types';
import { EpisodeTypeEnum } from '@/core/types/api/episode';
import { dayjs } from '@/core/util';
import useEventCallback from '@/hooks/useEventCallback';
import useFlattenListResult from '@/hooks/useFlattenListResult';

import type { SeriesContextType } from '@/components/Collection/constants';

const pageSize = 26;

type FilterOptionsType = {
  type: EpisodeTypeEnum[];
  includeMissing: IncludeOnlyFilterEnum;
  includeWatched: IncludeOnlyFilterEnum;
  includeHidden: IncludeOnlyFilterEnum;
  includeUnaired: IncludeOnlyFilterEnum;
  search: string;
};

const SeriesEpisodes = () => {
  const { series } = useOutletContext<SeriesContextType>();

  const [searchParams, setSearchParams] = useSearchParams();

  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedEpisodes, setSelectedEpisodes] = useState<Set<number>>(new Set());
  const [debouncedSearch] = useDebounceValue(searchParams.get('search'), 200);

  const filterOptions = useMemo(() => ({
    type: [searchParams.get('type') ?? EpisodeTypeEnum.Normal],
    includeMissing: searchParams.get('includeMissing') ?? IncludeOnlyFilterEnum.false,
    includeWatched: searchParams.get('includeWatched') ?? IncludeOnlyFilterEnum.true,
    includeHidden: searchParams.get('includeHidden') ?? IncludeOnlyFilterEnum.false,
    includeUnaired: searchParams.get('includeUnaired') ?? IncludeOnlyFilterEnum.false,
    search: debouncedSearch ?? '',
  } as FilterOptionsType), [debouncedSearch, searchParams]);

  const onFilterChange = useEventCallback((event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id: eventType, value } = event.target;
    setSearchParams((currentParams) => {
      const newParams = new URLSearchParams(currentParams);
      newParams.set(eventType, value);
      return newParams;
    });
  });

  const onSelectionChange = useEventCallback((episodeId: number) => {
    setSelectedEpisodes((prevState) => {
      const selectionList = new Set(prevState);
      if (!selectionList.delete(episodeId)) selectionList.add(episodeId);
      return selectionList;
    });
  });

  useEffect(() => {
    setSelectedEpisodes(new Set());
  }, [filterOptions]);

  const seriesEpisodesQuery = useSeriesEpisodesInfiniteQuery(
    series.IDs.ID,
    {
      pageSize,
      includeDataFrom: ['AniDB'],
      ...filterOptions,
    },
  );
  const {
    data,
    fetchNextPage,
    isFetchingNextPage,
    isPending,
    isSuccess,
  } = seriesEpisodesQuery;
  const [episodes, episodeCount] = useFlattenListResult(data);

  const { mutate: watchEpisode } = useWatchSeriesEpisodesMutation(series.IDs.ID);

  const hasMissingEpisodes = useMemo(
    () => ((series.Sizes.Missing.Episodes ?? 0) > 0),
    [series.Sizes],
  );

  const startDate = useMemo(
    () => (series.AniDB?.AirDate != null ? dayjs(series.AniDB?.AirDate) : null),
    [series],
  );
  const endDate = useMemo(
    () => (series.AniDB?.EndDate != null ? dayjs(series.AniDB?.EndDate) : null),
    [series],
  );
  const hasUnairedEpisodes = useMemo(
    () => (!!startDate && (endDate === null || endDate.isAfter(dayjs()))),
    [startDate, endDate],
  );

  const { scrollRef } = useOutletContext<SeriesContextType>();

  const rowVirtualizer = useVirtualizer({
    count: episodeCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 370, // 370px is the minimum height of a loaded row
    overscan: 5,
    gap: 16,
  });
  const virtualItems = rowVirtualizer.getVirtualItems();

  const fetchNextPageDebounced = useMemo(
    () =>
      debounce(() => {
        fetchNextPage().catch(() => {});
      }, 50),
    [fetchNextPage],
  );

  const markFilteredWatched = useEventCallback(() => watchEpisode({ value: true, ...filterOptions }));
  const markFilteredUnwatched = useEventCallback(() => watchEpisode({ value: false, ...filterOptions }));

  const resetSelection = useEventCallback(() => setSelectedEpisodes(new Set()));

  const openOptionsModal = useEventCallback(() => setShowOptionsModal(true));

  return (
    <>
      <title>{`${series.Name} > Episodes | Shoko`}</title>
      <div className="flex w-full gap-x-6">
        <EpisodeSearchAndFilterPanel
          onFilterChange={onFilterChange}
          search={filterOptions.search}
          type={filterOptions.type[0]}
          availability={filterOptions.includeMissing}
          watched={filterOptions.includeWatched}
          hidden={filterOptions.includeHidden}
          unaired={filterOptions.includeUnaired}
          hasUnaired={hasUnairedEpisodes}
          hasMissing={hasMissingEpisodes}
        />
        <div className="flex grow flex-col gap-y-4">
          <div className="flex h-[6.125rem] items-center justify-between rounded-lg border border-panel-border bg-panel-background-transparent px-6 py-4">
            <div className="flex flex-wrap text-xl font-semibold 2xl:flex-nowrap">
              <span>Episodes</span>
              <span className="hidden px-2 2xl:inline">|</span>
              <span>
                <span className="pr-2 text-panel-text-important">
                  {isSuccess ? episodeCount : '-'}
                </span>
                Entries Listed
                {selectedEpisodes.size > 0 && (
                  <>
                    &nbsp;|&nbsp;
                    <span className="text-panel-text-important">
                      {selectedEpisodes.size}
                    </span>
                    &nbsp;Entries Selected
                  </>
                )}
              </span>
            </div>
            <div className="flex flex-row gap-x-2">
              {selectedEpisodes.size > 0 && (
                <Button buttonType="secondary" buttonSize="normal" className="flex gap-x-2" onClick={resetSelection}>
                  <Icon path={mdiCloseCircleOutline} size={1} />
                  Cancel Selection
                </Button>
              )}
              <Button buttonType="secondary" buttonSize="normal" className="flex gap-x-2" onClick={openOptionsModal}>
                <Icon path={mdiEyeOutline} size={1} />
                Options
              </Button>
            </div>
          </div>
          <div className="grow">
            {isPending
              ? (
                <div className="flex h-full items-center justify-center text-panel-text-primary">
                  <Icon path={mdiLoading} spin size={4} />
                </div>
              )
              : (
                <div className="relative w-full" style={{ height: rowVirtualizer.getTotalSize() }}>
                  {virtualItems.map((virtualItem) => {
                    const page = Math.ceil((virtualItem.index + 1) / pageSize);
                    const episode = episodes[virtualItem.index];

                    if (!episode && !isFetchingNextPage) fetchNextPageDebounced();

                    return (
                      <div
                        key={episode ? episode.IDs.ID : `loading-${virtualItem.key}`}
                        className="absolute left-0 top-0 flex w-full flex-col rounded-lg border border-panel-border bg-panel-background-transparent"
                        data-index={virtualItem.index}
                        style={{ transform: `translateY(${virtualItem.start ?? 0}px)` }}
                        ref={rowVirtualizer.measureElement}
                      >
                        {episode
                          ? (
                            <EpisodeSummary
                              selected={selectedEpisodes.has(episode.IDs.ID)}
                              onSelectionChange={() => onSelectionChange(episode.IDs.ID)}
                              seriesId={series.IDs.ID}
                              anidbSeriesId={series.IDs.AniDB}
                              episode={episode}
                              page={page}
                            />
                          )
                          : (
                            <div className="flex h-[20.75rem] items-center justify-center p-6 text-panel-text-primary">
                              <Icon path={mdiLoading} spin size={3} />
                            </div>
                          )}
                      </div>
                    );
                  })}
                </div>
              )}
          </div>
        </div>
        <EpisodeWatchModal
          show={showOptionsModal}
          onRequestClose={() => setShowOptionsModal(false)}
          markFilteredWatched={markFilteredWatched}
          markFilteredUnwatched={markFilteredUnwatched}
        />
      </div>
    </>
  );
};

export default SeriesEpisodes;
