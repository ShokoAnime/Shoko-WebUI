import React from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../../core/store';
import FixedPanel from '../../../components/Panels/FixedPanel';

function SeriesBreakdown() {
  const hasFetched = useSelector((state: RootState) => state.mainpage.fetched.stats);
  const stats = useSelector((state: RootState) => state.mainpage.stats);

  const renderItem = (key: string, title: string, value = 0) => (
    <div key={key} className="flex mt-3 first:mt-2">
      <div className="flex-grow">
        {title}
      </div>
      <div className="color-highlight-1">
        {value}
      </div>
    </div>
  );

  const childrenLeft = [
    renderItem('missing-episodes-collecting', 'Missing Episodes (Collecting)', stats.MissingEpisodesCollecting),
    renderItem('missing-episodes', 'Missing Episodes (Total)', stats.MissingEpisodes),
    renderItem('missing-links', 'Missing TvDB/TMDB Links', stats.SeriesWithMissingLinks),
  ];
  const childrenRight = [
    renderItem('unrecognized-files', 'Unrecognized Files', stats.UnrecognizedFiles),
    renderItem('multiple-files', 'Multiple Files', stats.EpisodesWithMultipleFiles),
    renderItem('duplicate-files', 'Duplicate Files', stats.FilesWithDuplicateLocations),
  ];

  return (
    <FixedPanel title="Series Breakdown" isFetching={!hasFetched}>
      <div className="flex">
        <div className="flex flex-col w-1/2 mr-6">
          {childrenLeft}
        </div>
        <div className="flex flex-col w-1/2 ml-6">
          {childrenRight}
        </div>
      </div>
    </FixedPanel>
  );
}

export default SeriesBreakdown;
