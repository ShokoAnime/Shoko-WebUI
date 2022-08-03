import React from 'react';
import { forEach } from 'lodash';

import ShokoPanel from '../../../components/Panels/ShokoPanel';

import { useGetDashboardSeriesSummaryQuery } from '../../../core/rtkQuery/dashboardApi';

const names = {
  Series: 'TV Series',
};

function CollectionTypeBreakdown() {
  const seriesSummary = useGetDashboardSeriesSummaryQuery();

  const renderName = (item: string, count: number, countPercentage: number) => (
    <div key={`${item}-name`} className="flex mt-3 first:mt-0">
      <span className="grow">{names[item] ?? item} - {count}</span>
      {countPercentage.toFixed(2)}%
    </div>
  );

  const renderBar = (item: string, countPercentage: number, counter: number) => (
    <div key={`${item}-bar`} className="flex bg-white rounded-lg mt-2">
      <div className={`rounded-lg h-4 bg-highlight-${counter}`} style={{ width: `${countPercentage}%` }} />
    </div>
  );

  let total = 0;
  const seriesSummaryArray: Array<any> = [];

  forEach(seriesSummary.data, (item, key) => {
    total += (item ?? 0);
    seriesSummaryArray.push([key, item]);
  });

  seriesSummaryArray.sort((a, b) => (a[1] < b[1] ? 1 : -1));

  const items: Array<React.ReactNode> = [];
  let counter = 0;

  forEach(seriesSummaryArray, (item) => {
    let countPercentage = 0;
    counter++;
    if (total) {
      countPercentage = (item[1] / total) * 100;
    }
    items.push(renderName(item[0], item[1], countPercentage));
    items.push(renderBar(item[0], countPercentage, counter));
  });

  return (
    <ShokoPanel title="Collection Type Breakdown" isFetching={seriesSummary.isLoading}>
      {items}
    </ShokoPanel>
  );
}

export default CollectionTypeBreakdown;
