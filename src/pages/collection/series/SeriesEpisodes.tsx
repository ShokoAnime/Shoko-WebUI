import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useOutletContext } from 'react-router-dom';
import { mdiCloseCircleOutline, mdiEyeOutline, mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { debounce, toNumber } from 'lodash';
import { useDebounceValue } from 'usehooks-ts';

import EpisodeSearchAndFilterPanel from '@/components/Collection/Episode/EpisodeSearchAndFilterPanel';
import EpisodeSummary from '@/components/Collection/Episode/EpisodeSummary';
import EpisodeWatchModal from '@/components/Collection/Episode/EpisodeWatchModal';
import Button from '@/components/Input/Button';
import toast from '@/components/Toast';
import { useWatchSeriesEpisodesMutation } from '@/core/react-query/series/mutations';
import { useSeriesEpisodesInfiniteQuery, useSeriesQuery } from '@/core/react-query/series/queries';
import { dayjs } from '@/core/util';
import useEventCallback from '@/hooks/useEventCallback';
import useFlattenListResult from '@/hooks/useFlattenListResult';

const pageSize = 26;

const SeriesEpisodes = () => {
  const { seriesId } = useParams();
  const [episodeFilterType, setEpisodeFilterType] = useState('Normal');
  const [episodeFilterAvailability, setEpisodeFilterAvailability] = useState('false');
  const [episodeFilterWatched, setEpisodeFilterWatched] = useState('true');
  const [episodeFilterHidden, setEpisodeFilterHidden] = useState('false');
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedEpisodes, setSelectedEpisodes] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounceValue(search, 200);

  const onSearchChange = useEventCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  });
  const onFilterChange = useEventCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const { id: eventType, value } = event.target;
    switch (eventType) {
      case 'episodeType':
        setEpisodeFilterType(value);
        break;
      case 'status':
        setEpisodeFilterAvailability(value);
        break;
      case 'watched':
        setEpisodeFilterWatched(value);
        break;
      case 'hidden':
        setEpisodeFilterHidden(value);
        break;
      default:
        break;
    }
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
  }, [episodeFilterType, episodeFilterAvailability, episodeFilterWatched, episodeFilterHidden, debouncedSearch]);

  const seriesQueryData = useSeriesQuery(toNumber(seriesId!), { includeDataFrom: ['AniDB'] }, !!seriesId).data;
  const seriesEpisodesQuery = useSeriesEpisodesInfiniteQuery(
    toNumber(seriesId!),
    {
      includeMissing: episodeFilterAvailability,
      includeHidden: episodeFilterHidden,
      type: episodeFilterType,
      includeWatched: episodeFilterWatched,
      includeDataFrom: ['AniDB', 'TvDB'],
      search: debouncedSearch,
      pageSize,
    },
    !!seriesId,
  );
  const {
    data,
    dataUpdatedAt,
    fetchNextPage,
    isFetchingNextPage,
    isSuccess,
  } = seriesEpisodesQuery;
  const [episodes, episodeCount] = useFlattenListResult(data);

  const { mutate: watchEpisode } = useWatchSeriesEpisodesMutation();

  const animeId = useMemo(() => seriesQueryData?.IDs.AniDB ?? 0, [seriesQueryData]);

  const hasMissingEpisodes = useMemo(
    () => ((seriesQueryData?.Sizes.Missing.Episodes ?? 0) > 0),
    [seriesQueryData?.Sizes],
  );

  const startDate = useMemo(
    () => (seriesQueryData?.AniDB?.AirDate != null ? dayjs(seriesQueryData?.AniDB?.AirDate) : null),
    [seriesQueryData],
  );
  const endDate = useMemo(
    () => (seriesQueryData?.AniDB?.EndDate != null ? dayjs(seriesQueryData?.AniDB?.EndDate) : null),
    [seriesQueryData],
  );
  const hasUnairedEpisodes = useMemo(
    () => (!!startDate && (endDate === null || endDate.isAfter(dayjs()))),
    [startDate, endDate],
  );

  const { scrollRef } = useOutletContext<{ scrollRef: React.RefObject<HTMLDivElement> }>();

  const rowVirtualizer = useVirtualizer({
    count: episodeCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 345, // 332px is the minimum height of a loaded row
    overscan: 5,
  });
  const virtualItems = rowVirtualizer.getVirtualItems();

  const fetchNextPageDebounced = useMemo(
    () =>
      debounce(() => {
        fetchNextPage().catch(() => {});
      }, 50),
    [fetchNextPage],
  );

  const handleMarkWatched = useEventCallback((watched: boolean) => {
    watchEpisode({
      seriesId: toNumber(seriesId),
      includeMissing: episodeFilterAvailability,
      includeHidden: episodeFilterHidden,
      type: episodeFilterType,
      includeWatched: episodeFilterWatched,
      value: watched,
      search,
    }, {
      onSuccess: () => toast.success(`Episodes marked as ${watched ? 'watched' : 'unwatched'}!`),
      onError: () => toast.error(`Failed to mark episodes as ${watched ? 'watched' : 'unwatched'}!`),
    });
  });

  const markFilteredWatched = useEventCallback(() => handleMarkWatched(true));
  const markFilteredUnwatched = useEventCallback(() => handleMarkWatched(false));

  const resetSelection = useEventCallback(() => setSelectedEpisodes(new Set()));

  const openOptionsModal = useEventCallback(() => setShowOptionsModal(true));

  return (
    <div className="flex w-full gap-x-6">
      <EpisodeSearchAndFilterPanel
        onSearchChange={onSearchChange}
        onFilterChange={onFilterChange}
        search={search}
        episodeFilterType={episodeFilterType}
        episodeFilterAvailability={episodeFilterAvailability}
        episodeFilterWatched={episodeFilterWatched}
        episodeFilterHidden={episodeFilterHidden}
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
          <div className="relative w-full" style={{ height: rowVirtualizer.getTotalSize() }}>
            <div
              className="absolute left-0 top-0 flex w-full flex-col gap-y-4 pb-8"
              style={{ transform: `translateY(${virtualItems[0]?.start ?? 0}px)` }}
            >
              {virtualItems.map((virtualItem) => {
                const page = Math.ceil((virtualItem.index + 1) / pageSize);
                const episode = episodes[virtualItem.index];

                if (!episode && !isFetchingNextPage) fetchNextPageDebounced();

                return (
                  <div
                    key={`${dataUpdatedAt}-${virtualItem.key}`}
                    className="flex flex-col rounded-lg border border-panel-border bg-panel-background-transparent"
                    data-index={virtualItem.index}
                  >
                    {episode
                      ? (
                        <EpisodeSummary
                          selected={selectedEpisodes.has(episode.IDs.ID)}
                          onSelectionChange={() => onSelectionChange(episode.IDs.ID)}
                          animeId={animeId}
                          episode={episode}
                          page={page}
                        />
                      )
                      : (
                        <div className="flex h-[332px] items-center justify-center p-6 text-panel-text-primary">
                          <Icon path={mdiLoading} spin size={3} />
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <EpisodeWatchModal
        show={showOptionsModal}
        onRequestClose={() => setShowOptionsModal(false)}
        markFilteredWatched={markFilteredWatched}
        markFilteredUnwatched={markFilteredUnwatched}
      />
    </div>
  );
};

export default SeriesEpisodes;
