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

  const renderColor = (type) => {
    switch (type) {
      case 'Series':
        return 'panel-primary';
      case 'Other':
        return 'panel-important';
      case 'Web':
        return 'panel-danger';
      case 'Movie':
        return 'panel-warning';
      case 'OVA':
        return 'panel-extra';
      default:
        return 'panel-primary';
    }
  };

  const renderName = (item: string, count: number, countPercentage: number) => (
    <div key={`${item}-name`} className="flex mt-5 first:mt-0">
      <span className="grow">{names[item] ?? item} - {count}</span>
      <span className={`font-semibold text-${renderColor(item)}`}>{countPercentage.toFixed(2)}%</span>
    </div>
  );

  const renderBar = (item: string, countPercentage: number) => (
    <div key={`${item}-bar`} className="flex bg-panel-background-alt rounded-md mt-2">
      <div className={`rounded-md h-4 bg-${renderColor(item)}`} style={{ width: `${countPercentage}%` }} />
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

  forEach(seriesSummaryArray, (item) => {
    let countPercentage = 0;
    if (total) {
      countPercentage = (item[1] / total) * 100;
    }
    items.push(renderName(item[0], item[1], countPercentage));
    items.push(renderBar(item[0], countPercentage));
  });

  return (
    <ShokoPanel title="Media Type" isFetching={seriesSummary.isLoading} editMode={layoutEditMode}>
      {items}
    </ShokoPanel>
  );
}

export default MediaType;
