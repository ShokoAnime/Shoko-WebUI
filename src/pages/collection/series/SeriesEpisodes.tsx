import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useOutletContext } from 'react-router-dom';
import { mdiEyeCheckOutline, mdiEyeOutline, mdiLoading, mdiMagnify } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { debounce, toNumber } from 'lodash';
import { useDebounceValue } from 'usehooks-ts';

import SeriesEpisode from '@/components/Collection/Series/SeriesEpisode';
import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import Select from '@/components/Input/Select';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import toast from '@/components/Toast';
import { useWatchSeriesEpisodesMutation } from '@/core/react-query/series/mutations';
import { useSeriesEpisodesInfiniteQuery, useSeriesQuery } from '@/core/react-query/series/queries';
import useEventCallback from '@/hooks/useEventCallback';
import useFlattenListResult from '@/hooks/useFlattenListResult';

const pageSize = 26;

type SearchAndFilterPanelProps = {
  episodeFilterType: string;
  episodeFilterAvailability: string;
  episodeFilterWatched: string;
  episodeFilterHidden: string;
  search: string;
  onFilterChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};
const SearchAndFilterPanel = React.memo(
  (
    {
      episodeFilterAvailability,
      episodeFilterHidden,
      episodeFilterType,
      episodeFilterWatched,
      onFilterChange,
      onSearchChange,
      search,
    }: SearchAndFilterPanelProps,
  ) => {
    const searchInput = useMemo(() => (
      <Input
        inputClassName=""
        id="search"
        label="Title Search"
        startIcon={mdiMagnify}
        type="text"
        placeholder="Search..."
        value={search}
        onChange={onSearchChange}
      />
    ), [onSearchChange, search]);
    const episodeType = useMemo(() => (
      <Select
        id="episodeType"
        label="Episode Type"
        value={episodeFilterType}
        onChange={onFilterChange}
      >
        <option value="">All</option>
        <option value="Normal">Normal</option>
        <option value="Special">Specials</option>
        <option value="Other">Others</option>
        <option value="ThemeSong,OpeningSong,EndingSong">Credits</option>
        <option value="Unknown,Trailer,Parody,Interview,Extra">Misc.</option>
      </Select>
    ), [episodeFilterType, onFilterChange]);
    const availability = useMemo(() => (
      <Select
        id="status"
        label="Availability"
        value={episodeFilterAvailability}
        onChange={onFilterChange}
      >
        <option value="true">All</option>
        <option value="false">Available</option>
        <option value="only">Missing</option>
      </Select>
    ), [episodeFilterAvailability, onFilterChange]);
    const watched = useMemo(() => (
      <Select
        id="watched"
        label="Watched Status"
        value={episodeFilterWatched}
        onChange={onFilterChange}
      >
        <option value="true">All</option>
        <option value="only">Watched</option>
        <option value="false">Unwatched</option>
      </Select>
    ), [episodeFilterWatched, onFilterChange]);
    const hidden = useMemo(() => (
      <Select
        id="hidden"
        label="Hidden Status"
        value={episodeFilterHidden}
        onChange={onFilterChange}
      >
        <option value="true">All</option>
        <option value="false">Not Hidden</option>
        <option value="only">Hidden</option>
      </Select>
    ), [episodeFilterHidden, onFilterChange]);
    return (
      <div className="flex flex-col gap-y-6">
        <ShokoPanel
          title="Search & Filter"
          className="w-400"
          contentClassName="gap-y-6"
          fullHeight={false}
          sticky
          transparent
        >
          {searchInput}
          {episodeType}
          {availability}
          {watched}
          {hidden}
        </ShokoPanel>
      </div>
    );
  },
);

const SeriesEpisodes = () => {
  const { seriesId } = useParams();
  const [episodeFilterType, setEpisodeFilterType] = useState('Normal');
  const [episodeFilterAvailability, setEpisodeFilterAvailability] = useState('false');
  const [episodeFilterWatched, setEpisodeFilterWatched] = useState('true');
  const [episodeFilterHidden, setEpisodeFilterHidden] = useState('false');
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
    }, {
      onSuccess: () => toast.success(`Episodes marked as ${watched ? 'watched' : 'unwatched'}!`),
      onError: () => toast.error(`Failed to mark episodes as ${watched ? 'watched' : 'unwatched'}!`),
    });
  });

  const markWatched = useEventCallback(() => handleMarkWatched(true));
  const markUnwatched = useEventCallback(() => handleMarkWatched(false));

  return (
    <div className="flex w-full gap-x-6">
      <SearchAndFilterPanel
        onSearchChange={onSearchChange}
        onFilterChange={onFilterChange}
        search={search}
        episodeFilterType={episodeFilterType}
        episodeFilterAvailability={episodeFilterAvailability}
        episodeFilterWatched={episodeFilterWatched}
        episodeFilterHidden={episodeFilterHidden}
      />
      <div className="flex grow gap-y-6">
        <div className="flex grow flex-col gap-y-4">
          <div className="flex items-center justify-between rounded-lg border border-panel-border bg-panel-background-transparent px-6 py-4">
            <div className="flex flex-wrap text-xl font-semibold 2xl:flex-nowrap">
              <span>Episodes</span>
              <span className="hidden px-2 2xl:inline">|</span>
              <span>
                <span className="pr-2 text-panel-text-important">
                  {isSuccess ? episodeCount : '-'}
                </span>
                Entries Listed
              </span>
            </div>
            <div className="flex gap-x-4 xl:gap-x-6">
              <Button
                className="flex items-center gap-x-3 !text-base"
                onClick={markWatched}
              >
                <Icon path={mdiEyeCheckOutline} size={1} />
                Mark Filtered As Watched
              </Button>
              <Button
                className="flex items-center gap-x-3 !text-base"
                onClick={markUnwatched}
              >
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
                      className="flex flex-col rounded-lg border border-panel-border bg-panel-background-transparent"
                      data-index={virtualItem.index}
                    >
                      {episode
                        ? <SeriesEpisode animeId={animeId} episode={episode} page={page} />
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
      </div>
    </div>
  );
};

export default SeriesEpisodes;
