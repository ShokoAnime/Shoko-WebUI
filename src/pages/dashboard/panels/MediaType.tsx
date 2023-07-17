import React from 'react';
import { useSelector } from 'react-redux';
import { forEach } from 'lodash';

import { RootState } from '@/core/store';
import ShokoPanel from '@/components/Panels/ShokoPanel';

import { useGetDashboardSeriesSummaryQuery } from '@/core/rtkQuery/splitV3Api/dashboardApi';

const names = {
  Series: 'TV Series',
};

function MediaType() {
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const seriesSummary = useGetDashboardSeriesSummaryQuery();

  const renderName = (item: string, count: number, countPercentage: number, counter: number) => (
    <div key={`${item}-name`} className="flex mt-5 first:mt-0">
      <span className="grow">{names[item] ?? item} - {count}</span>
      <span className={`font-semibold text-highlight-${counter}`}>{countPercentage.toFixed(2)}%</span>
    </div>
  );

  const renderBar = (item: string, countPercentage: number, counter: number) => (
    <div key={`${item}-bar`} className="flex bg-background-border rounded-md mt-2">
      <div className={`rounded-md h-4 bg-highlight-${counter}`} style={{ width: `${countPercentage}%` }} />
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
    counter += 1;
    if (total) {
      countPercentage = (item[1] / total) * 100;
    }
    items.push(renderName(item[0], item[1], countPercentage, counter));
    items.push(renderBar(item[0], countPercentage, counter));
  });

  return (
    <ShokoPanel title="Media Type" isFetching={seriesSummary.isLoading} editMode={layoutEditMode}>
      {items}
    </ShokoPanel>
  );
}

export default MediaType;
