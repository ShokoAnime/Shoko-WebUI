import React from 'react';
import { useSelector } from 'react-redux';
import { forEach } from 'lodash';

import { RootState } from '../../../core/store';
import ShokoPanel from '../../../components/Panels/ShokoPanel';

const colors = {
  Series: '#FF3F57',
  OVA: '#F1C40F',
  Movie: '#279CEB',
  Other: '#DA3FFF',
};

function CollectionTypeBreakdown() {
  const hasFetched = useSelector((state: RootState) => state.mainpage.fetched.seriesSummary);
  const seriesSummary = useSelector((state: RootState) => state.mainpage.seriesSummary);

  const renderName = (item: string, count: number, countPercentage: number) => (
    <div key={`${item}-name`} className="flex mt-3 first:mt-0">
      <span className="flex-grow">{item} - {count}</span>
      {countPercentage.toFixed(2)}%
    </div>
  );

  const renderBar = (item: string, countPercentage: number) => (
    <div key={`${item}-bar`} className="flex bg-white rounded-lg mt-2">
      <div className="rounded-lg h-4" style={{ width: `${countPercentage}%`, backgroundColor: colors[item] }} />
    </div>
  );

  let total = 0;
  const seriesSummaryArray: Array<any> = [];

  forEach(seriesSummary, (item, key) => {
    total += (item ?? 0);
    seriesSummaryArray.push([key, item]);
  });

  seriesSummaryArray.sort((a, b) => (a[1] < b[1] ? 1 : -1));

  const items: Array<React.ReactNode> = [];

  forEach(seriesSummaryArray, (item) => {
    let countPercentage = 0;
    if (total) {
      countPercentage = (item[1] / total) * 100;
    }
    items.push(renderName(item[0], item[1], countPercentage));
    items.push(renderBar(item[0], countPercentage));
  });

  return (
    <ShokoPanel title="Collection Type Breakdown" isFetching={!hasFetched}>
      {items}
    </ShokoPanel>
  );
}

export default CollectionTypeBreakdown;
