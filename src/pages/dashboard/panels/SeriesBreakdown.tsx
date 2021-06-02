import React from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../../core/store';
import FixedPanel from '../../../components/Panels/FixedPanel';

function SeriesBreakdown() {
  const hasFetched = useSelector((state: RootState) => state.mainpage.fetched.stats);
  const stats = useSelector((state: RootState) => state.mainpage.stats);

  const renderItem = (title: string, value = 0, key: string) => (
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
    renderItem('Missing Episodes (Collecting)', stats.MissingEpisodesCollecting, 'missing-episodes-collecting'),
    renderItem('Missing Episodes (Total)', stats.MissingEpisodes, 'missing-episodes'),
    renderItem('Missing TvDB/TMDB Links', stats.SeriesWithMissingLinks, 'missing-links'),
  ];
  const childrenRight = [
    renderItem('Unrecognized Files', stats.UnrecognizedFiles, 'unrecognized-files'),
    renderItem('Multiple Files', stats.EpisodesWithMultipleFiles, 'multiple-files'),
    renderItem('Duplicate Files', stats.FilesWithDuplicateLocations, 'duplicate-files'),
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
