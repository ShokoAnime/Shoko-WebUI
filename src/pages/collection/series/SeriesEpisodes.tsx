import { useParams } from 'react-router';
import { useLazyGetSeriesEpisodesInfiniteQuery } from '../../../core/rtkQuery/splitV3Api/seriesApi';
import { EpisodeType } from '../../../core/types/api/episode';
import { get, toNumber } from 'lodash';
import BackgroundImagePlaceholderDiv from '../../../components/BackgroundImagePlaceholderDiv';
import { Icon } from '@mdi/react';
import { mdiEyeCheckOutline, mdiEyeOutline, mdiMagnify } from '@mdi/js';
import ShokoPanel from '../../../components/Panels/ShokoPanel';
import React, { useEffect, useState } from 'react';
import { ImageType } from '../../../core/types/api/common';
import Input from '../../../components/Input/Input';
import Select from '../../../components/Input/Select';
import { AutoSizer, InfiniteLoader, List } from 'react-virtualized';
import { NavLink } from 'react-router-dom';
import { EpisodeDetails } from '../items/EpisodeDetails';
import Button from '../../../components/Input/Button';

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

  const loadMoreRows = ({ startIndex }) => {
    return fetchEpisodes({ 
      seriesID: toNumber(seriesId),
      includeMissing: episodeFilterStatus,
      type: episodeFilterType,
      includeWatched: episodeFilterWatched, 
      includeDataFrom: ['AniDB', 'TvDB'],
      page: Math.round(startIndex / pageSize) + 1, 
      pageSize,
    });
  };

  useEffect(() => {
    loadMoreRows({ startIndex: 0 }).catch(() => {});
  }, [episodeFilterType, episodeFilterStatus, episodeFilterWatched]);
  const isRowLoaded = ({ index }) => !!episodes[index];

  const getThumbnailUrl = (episode: EpisodeType) => {
    const thumbnail = get<EpisodeType, string, ImageType | null>(episode, 'TvDB.0.Thumbnail', null);
    if (thumbnail === null) { return null; }
    return `/api/v3/Image/TvDB/Thumb/${thumbnail.ID}`;
  };

  const renderEpisode = episode => (
    <React.Fragment>
      <NavLink to={`${episode.IDs.ID}`}>
        <div className="flex space-x-8">
          <BackgroundImagePlaceholderDiv imageSrc={getThumbnailUrl(episode)} className="h-[8.4375rem] min-w-[15rem] rounded drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-black my-2" />
          <EpisodeDetails episode={episode}/>
        </div>
        <div className="border-background-border border-b-2"/>
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
      <div className="flex space-x-9">
        <ShokoPanel title="Episodes" className="flex flex-col grow">
          <div className="my-4 p-3 flex justify-between bg-background-nav border-background-border">
            <div className="flex space-x-3">
              <div className="space-x-2 flex">
                <Icon path={mdiEyeCheckOutline} size={1} />
                <span>Mark All Watched</span>
              </div>
              <div className="space-x-2 flex">
                <Icon path={mdiEyeOutline} size={1} />
                <span>Mark All Unwatched</span>
              </div>
              <div className="space-x-2 flex">
                <Icon path={mdiEyeCheckOutline} size={1} />
                <span>Mark Range Watched</span>
              </div>
              <div className="space-x-2 flex">
                <Icon path={mdiEyeOutline} size={1} />
                <span>Mark Range Unwatched</span>
              </div>
            </div>
            <div className="font-semibold">
              <span className="text-highlight-2 mr-2">{episodesTotal}</span>
              Episodes
            </div>
          </div>
          <InfiniteLoader loadMoreRows={loadMoreRows} isRowLoaded={isRowLoaded} rowCount={episodesTotal} minimumBatchSize={20} threshold={3}>
            {({ onRowsRendered, registerChild }) => (
              <AutoSizer disableHeight>
                {({ width }) => (
                  <List height={600} onRowsRendered={onRowsRendered} ref={registerChild} rowCount={episodesTotal} rowHeight={151} rowRenderer={rowRenderer} width={width}/>  
                )}
              </AutoSizer>
            )}
          </InfiniteLoader>
        </ShokoPanel>
        <div className="grow-0 shrink-0 w-[23rem] flex flex-col align-top">
          <div>
            <ShokoPanel title="Episode Search" fullHeight={false} className="mb-4">
              <Input id="search" startIcon={mdiMagnify} type="text" placeholder="Search..." className="w-full bg-background-alt" value={search} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)} />
            </ShokoPanel>
            <ShokoPanel title="Filter">
              <div className="space-y-3">
                <Select id="episodeType" label="Type" value={episodeFilterType} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => { setEpisodeFilterType(event.currentTarget.value); }}>
                  <option value="2">Episodes</option>
                  <option value="3">Specials</option>
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
                <div>
                  <Button>Filter</Button>
                </div>
              </div>
            </ShokoPanel>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};


export default SeriesEpisodes;