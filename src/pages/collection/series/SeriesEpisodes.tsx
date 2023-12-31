import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useOutletContext } from 'react-router-dom';
import { mdiEyeCheckOutline, mdiEyeOutline, mdiLoading, mdiMagnify } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { debounce, toNumber } from 'lodash';
import { useDebounce, useEventCallback } from 'usehooks-ts';

import SeriesEpisode from '@/components/Collection/Series/SeriesEpisode';
import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import Select from '@/components/Input/Select';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import toast from '@/components/Toast';
import { useWatchSeriesEpisodesMutation } from '@/core/react-query/series/mutations';
import { useSeriesEpisodesInfiniteQuery, useSeriesQuery } from '@/core/react-query/series/queries';
import { useFlattenListResult } from '@/hooks/useFlattenListResult';

const pageSize = 26;

const SeriesEpisodes = () => {
  const { seriesId } = useParams();
  const [episodeFilterType, setEpisodeFilterType] = useState('Normal');
  const [episodeFilterAvailability, setEpisodeFilterAvailability] = useState('false');
  const [episodeFilterWatched, setEpisodeFilterWatched] = useState('true');
  const [episodeFilterHidden, setEpisodeFilterHidden] = useState('false');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 200);

  const seriesQuery = useSeriesQuery(toNumber(seriesId!), { includeDataFrom: ['AniDB'] }, !!seriesId);
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

  const animeId = useMemo(() => seriesQuery.data?.IDs.AniDB ?? 0, [seriesQuery.data]);

  const { scrollRef } = useOutletContext<{ scrollRef: React.RefObject<HTMLDivElement> }>();
  const rowVirtualizer = useVirtualizer({
    count: episodeCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 332, // 332px is the minimum height of a loaded row
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
    }, {
      onSuccess: () => toast.success(`Episodes marked as ${watched ? 'watched' : 'unwatched'}!`),
      onError: () => toast.error(`Failed to mark episodes as ${watched ? 'watched' : 'unwatched'}!`),
    });
  });

  return (
    <>
      <ShokoPanel
        title="Search & Filter"
        className="flex w-full flex-row"
        contentClassName="!flex-row gap-x-8"
        transparent
        fullHeight={false}
      >
        <Input
          inputClassName="w-full max-w-[15rem]"
          id="search"
          label="Title Search"
          startIcon={mdiMagnify}
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)}
        />
        <Select
          className="w-full max-w-[15rem]"
          id="episodeType"
          label="Episode Type"
          value={episodeFilterType}
          onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setEpisodeFilterType(event.currentTarget.value)}
        >
          <option value="">All</option>
          <option value="Normal">Normal</option>
          <option value="Special">Specials</option>
          <option value="Other">Others</option>
          <option value="ThemeSong,OpeningSong,EndingSong">Credits</option>
          <option value="Unknown,Trailer,Parody,Interview,Extra">Misc.</option>
        </Select>
        <Select
          className="w-full max-w-[15rem]"
          id="status"
          label="Availability"
          value={episodeFilterAvailability}
          onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
            setEpisodeFilterAvailability(event.currentTarget.value)}
        >
          <option value="true">All</option>
          <option value="false">Available</option>
          <option value="only">Missing</option>
        </Select>
        <Select
          className="w-full max-w-[15rem]"
          id="watched"
          label="Watched Status"
          value={episodeFilterWatched}
          onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setEpisodeFilterWatched(event.currentTarget.value)}
        >
          <option value="true">All</option>
          <option value="only">Watched</option>
          <option value="false">Unwatched</option>
        </Select>
        <Select
          className="w-full max-w-[15rem]"
          id="hidden"
          label="Hidden Status"
          value={episodeFilterHidden}
          onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setEpisodeFilterHidden(event.currentTarget.value)}
        >
          <option value="true">All</option>
          <option value="false">Not Hidden</option>
          <option value="only">Hidden</option>
        </Select>
      </ShokoPanel>
      <div className="flex gap-x-8">
        <div className="flex grow flex-col gap-y-4">
          <div className="flex items-center justify-between rounded-md border border-panel-border bg-panel-background-transparent px-8 py-4">
            <div className="text-xl font-semibold">
              Episodes
              <span className="px-2">|</span>
              <span className="pr-2 text-panel-text-important">
                {isSuccess ? episodeCount : '-'}
              </span>
              Entries Listed
            </div>
            <div className="flex gap-x-6">
              <Button className="flex gap-x-2 !font-normal" onClick={() => handleMarkWatched(true)}>
                <Icon path={mdiEyeCheckOutline} size={1} />
                Mark Filtered As Watched
              </Button>
              <Button className="flex gap-x-2 !font-normal" onClick={() => handleMarkWatched(false)}>
                <Icon path={mdiEyeOutline} size={1} />
                Mark Filtered As Unwatched
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
                      className="flex flex-col rounded-md border border-panel-border bg-panel-background-transparent"
                      data-index={virtualItem.index}
                    >
                      {episode
                        ? <SeriesEpisode animeId={animeId} episode={episode} page={page} />
                        : (
                          <div className="flex h-[332px] items-center justify-center p-8 text-panel-text-primary">
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
      </div>
    </>
  );
};

export default SeriesEpisodes;
