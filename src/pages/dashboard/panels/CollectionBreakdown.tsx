import React from 'react';
import { useSelector } from 'react-redux';
import prettyBytes from 'pretty-bytes';

import { RootState } from '../../../core/store';
import ShokoPanel from '../../../components/Panels/ShokoPanel';

function CollectionBreakdown() {
  const hasFetched = useSelector((state: RootState) => state.mainpage.fetched.stats);
  const stats = useSelector((state: RootState) => state.mainpage.stats);

  const renderItem = (key: string, title: string, value: string | number = 0) => (
    <div key={key} className="flex">
      <div className="flex-grow">
        {title}
      </div>
      <div className="font-semibold">{value}</div>
    </div>
  );

  const childrenFirst = [
    renderItem('series', 'Series', stats.SeriesCount),
    renderItem('series-completed', 'Series Completed', stats.FinishedSeries),
    renderItem('episodes-watched', 'Episodes Watched', stats.WatchedEpisodes),
    renderItem('hours-watched', 'Hours Watched', `${stats.WatchedHours || 0} H`),
  ];
  const childrenSecond = [
    renderItem('collection-size', 'Collection Size', `${prettyBytes(stats.FileSize || 0, { binary: true })}`),
    renderItem('files', 'Files', stats.FileCount),
    renderItem('unrecognized-files', 'Unrecognized Files', stats.UnrecognizedFiles),
    renderItem('multiple-files', 'Multiple Files', stats.EpisodesWithMultipleFiles),
    renderItem('duplicate-files', 'Duplicate Files', stats.FilesWithDuplicateLocations),
  ];

  const childrenThird = [
    renderItem('missing-links', 'Missing TvDB/TMDB Links', stats.SeriesWithMissingLinks),
    renderItem('missing-episodes-collecting', 'Missing Episodes (Collecting)', stats.MissingEpisodesCollecting),
    renderItem('missing-episodes', 'Missing Episodes (Total)', stats.MissingEpisodes),
  ];

  return (
    <ShokoPanel title="Collection Breakdown" isFetching={!hasFetched}>
      <div className="flex flex-col leading-5">
        {childrenFirst}
      </div>
      <div className="flex flex-col mt-6 leading-5">
        {childrenSecond}
      </div>
      <div className="flex flex-col mt-6 leading-5">
        {childrenThird}
      </div>
    </ShokoPanel>
  );
}

export default CollectionBreakdown;
