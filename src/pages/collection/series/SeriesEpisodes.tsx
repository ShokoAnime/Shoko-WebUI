import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { useOutletContext } from 'react-router-dom';
import { toNumber } from 'lodash';
import { Icon } from '@mdi/react';
import { mdiEyeCheckOutline, mdiEyeOutline, mdiLoading, mdiMagnify } from '@mdi/js';
import { useVirtualizer } from '@tanstack/react-virtual';

import { useLazyGetSeriesEpisodesQuery } from '@/core/rtkQuery/splitV3Api/seriesApi';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import Input from '@/components/Input/Input';
import Select from '@/components/Input/Select';
import SeriesEpisode from '@/pages/collection/items/SeriesEpisode';
import type { EpisodeType } from '@/core/types/api/episode';

const pageSize = 26;
const debounceValue = 200; // milliseconds

const SeriesEpisodes = () => {
  const { seriesId } = useParams();
  const [search, setSearch] = useState('');
  const [episodeFilterType, setEpisodeFilterType] = useState('Normal');
  const [episodeFilterAvailability, setEpisodeFilterAvailability] = useState('false');
  const [episodeFilterWatched, setEpisodeFilterWatched] = useState('true');
  const [fetchedPages, setFetchedPages] = useState<Record<number, EpisodeType[]> & { totalEpisodes: number }>({ totalEpisodes: 0 });
  const [fetchEpisodes, episodesData] = useLazyGetSeriesEpisodesQuery();

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { scrollRef } = useOutletContext<{ scrollRef: React.RefObject<HTMLDivElement> }>();

  const rowVirtualizer = useVirtualizer({
    count: fetchedPages.totalEpisodes,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 332, // 332px is the minimum height of a loaded row
    overscan: 5,
  });
  const virtualItems = rowVirtualizer.getVirtualItems();

  // Fetch a page, but only if we stop scrolling for a bit, and only fetch the
  // same page once until the filters changed again.
  const fetchPage = useCallback((page: number) => {
    // Return now if we're already fetching the page.
    if (fetchedPages[page] !== undefined) return;
    // Clear the timeout to fetch the last page in view if any.
    if (timeoutRef.current) { 
      clearTimeout(timeoutRef.current);
    }
    // Set a new timeout to fetch the current page in view.
    const localRef = timeoutRef.current = setTimeout(() => {
      if (timeoutRef.current === localRef)
        timeoutRef.current = null;
      // Do an async fetch for the page and tell the other parts of the code
      // that we're fetching the page by adding a temporarily empty list — so we
      // won't try to re-fetch the same page over and over again.
      setFetchedPages((record) => {
        fetchEpisodes({ 
          seriesID: toNumber(seriesId),
          includeMissing: episodeFilterAvailability,
          type: episodeFilterType,
          includeWatched: episodeFilterWatched,
          includeDataFrom: ['AniDB', 'TvDB'],
          page,
          search,
          pageSize,
        }).then((result) => {
          if (!result.isSuccess || !result.data) return;
          const data = result.data;
          setFetchedPages(record1 => ({ ...record1, [page]: data.List, totalEpisodes: data.Total }));
        }, reason => console.error(reason));

        return { ...record, [page]: [] };
      });
    }, debounceValue);
  }, [fetchedPages, search, episodeFilterAvailability, episodeFilterType, episodeFilterWatched]);

  useEffect(() => {
    // Clear the timeout if we we're scrolling while changing the filter.
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Clear all cached pages, but keep the count so the UI doesn't flip out
    // until the first new page is fetched.
    setFetchedPages({ totalEpisodes: fetchedPages.totalEpisodes });

    // Schedule a fetch of the first page, this will only fetch the first page
    // when the totalEpisodes count is zero and/or we're already on the first
    // page, otherwise will the code below ensure that only the current page(s)
    // in view will be fetched.
    fetchPage(1);
  }, [search, episodeFilterAvailability, episodeFilterType, episodeFilterWatched]);

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
          <option value="false">Unwatched</option>
        </Select>
      </ShokoPanel>
      <div className="flex flex-col grow gap-y-4">
        <div className="rounded-md bg-background-alt/50 px-8 py-4 flex justify-between items-center border-background-border border">
          <div className="font-semibold text-xl">
            Episodes
            <span className="px-2">|</span>
            <span className="text-highlight-2 pr-2">{episodesData.isUninitialized || episodesData.isLoading ? '-' : fetchedPages.totalEpisodes }</span>
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
        {fetchedPages.totalEpisodes !== 0 && (<div className="grow">
          <div className="w-full relative" style={{ height: rowVirtualizer.getTotalSize() }}>
            <div className="w-full absolute top-0 left-0 flex flex-col gap-y-4" style={{ transform: `translateY(${virtualItems[0]?.start ?? 0}px)` }}>
              {virtualItems.map((virtualItem) => {
                const index = virtualItem.index;
                const neededPage = Math.ceil((index + 1) / pageSize);
                const relativeIndex = index % pageSize;
                const episodeList = fetchedPages[neededPage];
                const item = episodeList !== undefined ? episodeList[relativeIndex] : undefined;
                if (episodeList === undefined) {
                  fetchPage(neededPage);
                }
                return (
                  <div
                    key={virtualItem.key}
                    ref={rowVirtualizer.measureElement}
                    className="flex flex-col border border-background-border rounded-md bg-background-alt/50"
                    data-index={virtualItem.index}
                  >
                    {item ? (
                      <SeriesEpisode episode={item} />
                    ) : (
                      <div className="flex items-center justify-center p-8 h-[332px] text-highlight-1"><Icon path={mdiLoading} spin size={3} /></div> // 332px is the minimum height of a loaded row
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>)}
      </div>
    </div>
  );
};


export default SeriesEpisodes;