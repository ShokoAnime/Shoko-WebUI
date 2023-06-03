import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useOutletContext } from 'react-router-dom';
import { toNumber } from 'lodash';
import { Icon } from '@mdi/react';
import { mdiEyeCheckOutline, mdiEyeOutline, mdiLoading, mdiMagnify } from '@mdi/js';
import { useVirtualizer } from '@tanstack/react-virtual';

import { useLazyGetSeriesEpisodesInfiniteQuery } from '@/core/rtkQuery/splitV3Api/seriesApi';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import Input from '@/components/Input/Input';
import Select from '@/components/Input/Select';
import SeriesEpisode from '@/pages/collection/items/SeriesEpisode';
import type { EpisodeType } from '@/core/types/api/episode';

const pageSize = 26;

const SeriesEpisodes = () => {
  const { seriesId } = useParams();
  const [search, setSearch] = useState('');
  const [episodeFilterType, setEpisodeFilterType] = useState('2');
  const [episodeFilterStatus, setEpisodeFilterStatus] = useState('false');
  const [episodeFilterWatched, setEpisodeFilterWatched] = useState('true');
  
  const [fetchEpisodes, episodesData] = useLazyGetSeriesEpisodesInfiniteQuery();
  const episodes: EpisodeType[] = episodesData?.data?.List ?? [] as EpisodeType[];
  const episodesTotal: number = episodesData?.data?.Total ?? 0;

  const { scrollRef } = useOutletContext<{ scrollRef: React.RefObject<HTMLDivElement> }>();

  const fetchMoreEpisodes = useCallback(async (startIndex: number) => {
    await fetchEpisodes({
      seriesID: toNumber(seriesId),
      includeMissing: episodeFilterStatus,
      type: episodeFilterType,
      includeWatched: episodeFilterWatched,
      includeDataFrom: ['AniDB', 'TvDB'],
      page: Math.round(startIndex / pageSize) + 1,
      search,
      pageSize,
    });
  }, [episodeFilterStatus, episodeFilterType, episodeFilterWatched, search]);

  const hasNextPage = useMemo(() => episodes.length < episodesTotal, [episodes.length, episodesTotal]);

  const rowVirtualizer = useVirtualizer({
    count: episodesTotal,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 332, // 332px is the minimum height of a loaded row
    overscan: 5,
  });
  const virtualItems = rowVirtualizer.getVirtualItems();

  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();

    if (
      !lastItem ||                                    // First load
      (lastItem.index >= episodes.length - 1 &&       // If number of virtual rows is more than number of episodes loaded
      hasNextPage && !episodesData.isFetching)
    ) {
      fetchMoreEpisodes(episodes.length).then(() => {}).catch(() => {});
    }
  }, [rowVirtualizer.getVirtualItems(), hasNextPage, episodesData.isFetching, fetchMoreEpisodes, episodes.length]);

  return (
    <div className="flex gap-x-8">
      <ShokoPanel title="Search & Filter" className="w-[25rem] sticky top-0" transparent contentClassName="gap-y-8">
        <Input id="search" label="Episode search" startIcon={mdiMagnify} type="text" placeholder="Search..." value={search} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)} />
        <Select id="episodeType" label="Type" value={episodeFilterType} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setEpisodeFilterType(event.currentTarget.value)}>
          <option value="2">Episodes</option>
          <option value="3">Specials</option>
          <option value="0,1,4,5,6,7,8,9,10">Other</option>
        </Select>
        <Select id="status" label="Episode Status" value={episodeFilterStatus} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setEpisodeFilterStatus(event.currentTarget.value)}>
          <option value="false">Available</option>
          <option value="only">Missing</option>
        </Select>
        <Select id="watched" label="Watched State" value={episodeFilterWatched} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setEpisodeFilterWatched(event.currentTarget.value)}>
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
            <span className="text-highlight-2 pr-2">{episodesTotal}</span>
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
        {episodes.length !== 0 && (<div className="grow">
          <div className="w-full relative" style={{ height: rowVirtualizer.getTotalSize() }}>
            <div className="w-full absolute top-0 left-0 flex flex-col gap-y-4" style={{ transform: `translateY(${virtualItems[0].start}px)` }}>
              {virtualItems.map((virtualRow) => {
                const isLoaderRow = virtualRow.index > episodes.length - 1;
                return (
                  <div
                    className="flex flex-col border border-background-border rounded-md bg-background-alt/50"
                    key={virtualRow.key}
                    data-index={virtualRow.index}
                    ref={rowVirtualizer.measureElement}
                  >
                    {isLoaderRow
                      ? <div className="flex items-center justify-center p-8 h-[332px] text-highlight-1"><Icon path={mdiLoading} spin size={3} /></div> // 332px is the minimum height of a loaded row
                      : <SeriesEpisode episode={episodes[virtualRow.index]} />
                    }
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