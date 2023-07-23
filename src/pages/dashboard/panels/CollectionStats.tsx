import React from 'react';
import { useSelector } from 'react-redux';
import prettyBytes from 'pretty-bytes';
import { Link } from 'react-router-dom';

import { RootState } from '@/core/store';
import ShokoPanel from '@/components/Panels/ShokoPanel';

import { useGetDashboardStatsQuery } from '@/core/rtkQuery/splitV3Api/dashboardApi';

function CollectionStats() {
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const stats = useGetDashboardStatsQuery();

  const renderItem = (key: string, title: string, value: string | number = 0, link?: string) => (
    <div key={key} className="flex">
      <div className="grow mb-1 last:mb-0">
        {title}
      </div>
      {link ? (
        <Link to={link} className="text-panel-primary">{value}</Link>
      ) : (
        <div>{value}</div>
      )}
    </div>
  );

  const childrenFirst = [
    renderItem('series', 'Series', stats.data?.SeriesCount),
    renderItem('series-completed', 'Series Completed', stats.data?.FinishedSeries),
    renderItem('episodes-watched', 'Episodes Watched', stats.data?.WatchedEpisodes),
    renderItem('hours-watched', 'Hours Watched', `${stats.data?.WatchedHours || 0} H`),
  ];
  const childrenSecond = [
    renderItem('collection-size', 'Collection Size', `${prettyBytes(stats.data?.FileSize || 0, { binary: true })}`),
    renderItem('files', 'Files', stats.data?.FileCount),
    renderItem('unrecognized-files', 'Unknown Files', stats.data?.UnrecognizedFiles, '/webui/utilities/unrecognized'),
    renderItem('multiple-files', 'Duplicate Episodes', stats.data?.EpisodesWithMultipleFiles),
    renderItem('duplicate-files', 'Duplicate Hashes', stats.data?.FilesWithDuplicateLocations),
  ];

  const childrenThird = [
    renderItem('missing-links', 'Missing TvDB/TMDB Links', stats.data?.SeriesWithMissingLinks),
    renderItem('missing-episodes-collecting', 'Missing Episodes (Collecting)', stats.data?.MissingEpisodesCollecting),
    renderItem('missing-episodes', 'Missing Episodes (Total)', stats.data?.MissingEpisodes),
  ];

  return (
    <ShokoPanel title="Collection Statistics" isFetching={stats.isLoading} editMode={layoutEditMode}>
      <div className="flex flex-col leading-5">
        {childrenFirst}
      </div>
      <div className="flex flex-col mt-4 leading-5">
        {childrenSecond}
      </div>
      <div className="flex flex-col mt-4 leading-5">
        {childrenThird}
      </div>
    </ShokoPanel>
  );
}

export default CollectionStats;
