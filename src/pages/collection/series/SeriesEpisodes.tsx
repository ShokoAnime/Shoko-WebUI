import { useParams } from 'react-router';
import { useLazyGetSeriesEpisodesInfiniteQuery } from '@/core/rtkQuery/splitV3Api/seriesApi';
import { EpisodeType } from '@/core/types/api/episode';
import { debounce, get, toNumber } from 'lodash';
import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import { Icon } from '@mdi/react';
import { mdiEyeCheckOutline, mdiEyeOutline, mdiMagnify } from '@mdi/js';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import React, { useEffect, useState } from 'react';
import { ImageType } from '@/core/types/api/common';
import Input from '@/components/Input/Input';
import Select from '@/components/Input/Select';
import { AutoSizer, InfiniteLoader, List, WindowScroller } from 'react-virtualized';
import { NavLink, useOutletContext } from 'react-router-dom';
import { EpisodeDetails } from '../items/EpisodeDetails';

const pageSize = 20;

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

  const loadMoreRows = ({ startIndex }) => {
    return fetchEpisodes({ 
      seriesID: toNumber(seriesId),
      includeMissing: episodeFilterStatus,
      type: episodeFilterType,
      includeWatched: episodeFilterWatched, 
      includeDataFrom: ['AniDB', 'TvDB'],
      page: Math.round(startIndex / pageSize) + 1,
      search,
      pageSize,
    });
  };

  const debouncedLoadMore = debounce(loadMoreRows, 200);

  useEffect(() => {
    debouncedLoadMore({ startIndex: 0 })?.catch(() => {});
  }, [episodeFilterType, episodeFilterStatus, episodeFilterWatched, search]);
  const isRowLoaded = ({ index }) => !!episodes[index];

  const getThumbnailUrl = (episode: EpisodeType) => {
    const thumbnail = get<EpisodeType, string, ImageType | null>(episode, 'TvDB.0.Thumbnail', null);
    if (thumbnail === null) { return null; }
    return `/api/v3/Image/TvDB/Thumb/${thumbnail.ID}`;
  };

  const renderEpisode = episode => (
    <React.Fragment>
      <NavLink to={`${episode.IDs.ID}`}>
        <div className="flex space-x-8 rounded bg-background-alt/25 p-8 border-background-border border">
          <BackgroundImagePlaceholderDiv imageSrc={getThumbnailUrl(episode)} className="h-[8.4375rem] min-w-[15rem] rounded drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-black my-2" />
          <EpisodeDetails episode={episode}/>
        </div>
      </NavLink>
    </React.Fragment>
  );
  
  const rowRenderer = ({ index, key, style }) => (
    <div key={key} style={style}>
      {episodes[index] && renderEpisode(episodes[index])}
    </div>
  );
  
  
  
  return (
    <React.Fragment>
      <div className="flex space-x-8">
        <div className="grow-0 shrink-0 w-[25rem] flex flex-col align-top">
          <div>
            <ShokoPanel title="Search & Filter" transparent>
              <div className="space-y-8">
                <Input id="search" label="Episode search" startIcon={mdiMagnify} type="text" placeholder="Search..." className="w-full bg-background-alt" value={search} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)} />
                <Select id="episodeType" label="Type" value={episodeFilterType} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => { setEpisodeFilterType(event.currentTarget.value); }}>
                  <option value="2">Episodes</option>
                  <option value="3">Specials</option>
                  <option value="0,1,4,5,6,7,8,9,10">Other</option>
                </Select>
                <Select className="hidden" id="season" label="Season" value={0} onChange={() => {}}>
                  <option value={0}>Season 01</option>
                </Select>
                <Select id="status" label="Episode Status" value={episodeFilterStatus} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => { setEpisodeFilterStatus(event.currentTarget.value); }}>
                  <option value="false">Available</option>
                  <option value="only">Missing</option>
                </Select>
                <Select id="watched" label="Watched State" value={episodeFilterWatched} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => { setEpisodeFilterWatched(event.currentTarget.value); }}>
                  <option value="true">All</option>
                  <option value="only">Watched</option>
                  <option value="false">Unwatched</option>
                </Select>
              </div>
            </ShokoPanel>
          </div>
        </div>
        <div className="flex flex-col grow space-y-4">
          <div className="rounded bg-background-alt/25 px-8 py-4 flex justify-between items-center border-background-border border">
            <div className="font-semibold text-xl">
              Episodes
              <span className="px-2">|</span>
              <span className="text-highlight-2 pr-2">{episodesTotal}</span>
              Entries Listed
            </div>
            <div className="flex space-x-3">
              <div className="space-x-2 flex">
                <Icon path={mdiEyeCheckOutline} size={1} />
                <span>Mark Filtered As Watched</span>
              </div>
              <div className="space-x-2 flex">
                <Icon path={mdiEyeOutline} size={1} />
                <span>Mark Filtered Unwatched</span>
              </div>
            </div>
          </div>
          <InfiniteLoader loadMoreRows={loadMoreRows} isRowLoaded={isRowLoaded} rowCount={episodesTotal} minimumBatchSize={20} threshold={3}>
            {({ onRowsRendered, registerChild }) => (
              <WindowScroller scrollElement={scrollRef.current ?? window}>
                {({ height, isScrolling, scrollTop }) => (
                  <AutoSizer disableHeight>
                    {({ width }) => (
                      <List
                        autoHeight
                        height={height}
                        onRowsRendered={onRowsRendered}
                        ref={registerChild}
                        rowCount={episodesTotal}
                        rowHeight={231}
                        rowRenderer={rowRenderer}
                        width={width}
                        scrollTop={scrollTop}
                        isScrolling={isScrolling}
                      />
                    )}
                  </AutoSizer>
                )}
              </WindowScroller>
            )}
          </InfiniteLoader>
        </div>
      </div>
    </React.Fragment>
  );
};


export default SeriesEpisodes;