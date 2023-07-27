import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useOutletContext } from 'react-router-dom';
import { debounce, toNumber } from 'lodash';
import { Icon } from '@mdi/react';
import { mdiEyeCheckOutline, mdiEyeOutline, mdiLoading, mdiMagnify } from '@mdi/js';
import { useVirtualizer } from '@tanstack/react-virtual';

import { useLazyGetSeriesEpisodesInfiniteQuery } from '@/core/rtkQuery/splitV3Api/seriesApi';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import Input from '@/components/Input/Input';
import Select from '@/components/Input/Select';
import SeriesEpisode from '@/components/Collection/Series/SeriesEpisode';

const pageSize = 26;

const SeriesEpisodes = () => {
  const { seriesId } = useParams();
  const [search, setSearch] = useState('');
  const [episodeFilterType, setEpisodeFilterType] = useState('Normal');
  const [episodeFilterAvailability, setEpisodeFilterAvailability] = useState('false');
  const [episodeFilterWatched, setEpisodeFilterWatched] = useState('true');
  const [episodeFilterHidden, setEpisodeFilterHidden] = useState('false');
  const [fetchingPage, setFetchingPage] = useState(false);
  const [fetchEpisodes, episodesData] = useLazyGetSeriesEpisodesInfiniteQuery();
  const episodePages = episodesData.data?.pages ?? {};
  const episodeTotal = episodesData.data?.total ?? 0;

  const { scrollRef } = useOutletContext<{ scrollRef: React.RefObject<HTMLDivElement> }>();

  const rowVirtualizer = useVirtualizer({
    count: episodeTotal,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 332, // 332px is the minimum height of a loaded row
    overscan: 5,
  });
  const virtualItems = rowVirtualizer.getVirtualItems();

  const fetchPage = useMemo(() => debounce((page: number) => {
    fetchEpisodes({
      seriesID: toNumber(seriesId),
      includeMissing: episodeFilterAvailability,
      includeHidden: episodeFilterHidden,
      type: episodeFilterType,
      includeWatched: episodeFilterWatched,
      includeDataFrom: ['AniDB', 'TvDB'],
      page,
      search,
      pageSize,
    }).then().catch(error => console.error(error)).finally(() => setFetchingPage(false));
  }, 200), [search, episodeFilterAvailability, episodeFilterType, episodeFilterWatched, episodeFilterHidden, seriesId, fetchEpisodes]);

  useEffect(() => {
    // Cancel fetch if query params change
    fetchPage.cancel();
    setFetchingPage(false);

    // Fetch first page if query params change as new data is required
    fetchPage(1);

    return () => fetchPage.cancel();
  }, [search, episodeFilterAvailability, episodeFilterType, episodeFilterWatched, fetchPage]);

  return (
    <div className="flex gap-x-8">
      <ShokoPanel title="Search & Filter" className="w-[25rem] sticky top-0" transparent contentClassName="gap-y-8">
        <Input id="search" label="Title Search" startIcon={mdiMagnify} type="text" placeholder="Search..." value={search} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)} />
        <Select id="episodeType" label="Episode Type" value={episodeFilterType} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setEpisodeFilterType(event.currentTarget.value)}>
          <option value="">All</option>
          <option value="Normal">Normal</option>
          <option value="Special">Specials</option>
          <option value="Other">Others</option>
          <option value="Unknown,ThemeVideo,Trailer,Parody">Misc.</option>
        </Select>
        <Select id="status" label="Availability" value={episodeFilterAvailability} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setEpisodeFilterAvailability(event.currentTarget.value)}>
          <option value="true">All</option>
          <option value="false">Available</option>
          <option value="only">Missing</option>
        </Select>
        <Select id="watched" label="Watched Status" value={episodeFilterWatched} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setEpisodeFilterWatched(event.currentTarget.value)}>
          <option value="true">All</option>
          <option value="only">Watched</option>
          <option value="false">Unwatched</option>`
        </Select>
        <Select id="hidden" label="Hidden Status" value={episodeFilterHidden} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setEpisodeFilterHidden(event.currentTarget.value)}>
          <option value="true">All</option>
          <option value="false">Not Hidden</option>
          <option value="only">Hidden</option>
        </Select>
      </ShokoPanel>
      <div className="flex flex-col grow gap-y-4">
        <div className="rounded-md bg-panel-background-transparent px-8 py-4 flex justify-between items-center border-panel-border border">
          <div className="font-semibold text-xl">
            Episodes
            <span className="px-2">|</span>
            <span className="text-panel-important pr-2">{episodesData.isUninitialized || episodesData.isLoading ? '-' : episodeTotal }</span>
            Entries Listed
          </div>
          <div className="flex gap-x-3">
            <div className="gap-x-2 flex">
              <Icon path={mdiEyeCheckOutline} size={1} />
              <span>Mark Filtered As Watched</span>
            </div>
            <div className="gap-x-2 flex">
              <Icon path={mdiEyeOutline} size={1} />
              <span>Mark Filtered Unwatched</span>
            </div>
          </div>
        </div>
        {episodeTotal !== 0 && (
        <div className="grow">
          <div className="w-full relative" style={{ height: rowVirtualizer.getTotalSize() }}>
            <div className="w-full absolute top-0 left-0 flex flex-col gap-y-4" style={{ transform: `translateY(${virtualItems[0]?.start ?? 0}px)` }}>
              {virtualItems.map((virtualItem) => {
                const { index } = virtualItem;
                const neededPage = Math.ceil((index + 1) / pageSize);
                const relativeIndex = index % pageSize;
                const episodeList = episodePages[neededPage];
                const item = episodeList !== undefined ? episodeList[relativeIndex] : undefined;
                if (episodeList === undefined && !fetchingPage) {
                  setFetchingPage(true);
                  fetchPage(neededPage);
                }
                return (
                  <div
                    key={virtualItem.key}
                    ref={rowVirtualizer.measureElement}
                    className="flex flex-col border border-panel-border rounded-md bg-panel-background-transparent"
                    data-index={virtualItem.index}
                  >
                    {item ? (
                      <SeriesEpisode episode={item} />
                    ) : (
                      <div className="flex items-center justify-center p-8 h-[332px] text-panel-primary"><Icon path={mdiLoading} spin size={3} /></div> // 332px is the minimum height of a loaded row
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default SeriesEpisodes;
