import React from 'react';
import { useSelector } from 'react-redux';
import prettyBytes from 'pretty-bytes';

import { RootState } from '../../../core/store';
import FixedPanel from '../../../components/Panels/FixedPanel';

function CollectionBreakdown() {
  const hasFetched = useSelector((state: RootState) => state.mainpage.fetched.stats);
  const stats = useSelector((state: RootState) => state.mainpage.stats);

  const renderItem = (key: string, title: string, value: string | number = 0) => (
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
    renderItem('series', 'Series', stats.SeriesCount),
    renderItem('files', 'Files', stats.FileCount),
    renderItem('collection-size', 'Collection Size', `${prettyBytes(stats.FileSize || 0, { binary: true })}`),
  ];
  const childrenRight = [
    renderItem('series-completed', 'Series Completed', stats.FinishedSeries),
    renderItem('episodes-watched', 'Episodes Watched', stats.WatchedEpisodes),
    renderItem('hours-watched', 'Hours Watched', `${stats.WatchedHours || 0} H`),
  ];

  return (
    <FixedPanel title="Collection Breakdown" isFetching={!hasFetched}>
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

export default CollectionBreakdown;
