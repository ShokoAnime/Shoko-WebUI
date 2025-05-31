import React from 'react';
import { useSelector } from 'react-redux';
import { forEach } from 'lodash';

import ShokoPanel from '@/components/Panels/ShokoPanel';
import { useDashboardSeriesSummaryQuery } from '@/core/react-query/dashboard/queries';

import type { RootState } from '@/core/store';

const names = {
  Series: 'TV Series',
};

const getColor = (type: string) => {
  switch (type) {
    case 'Series':
      return 'panel-text-primary';
    case 'Other':
      return 'panel-text-other';
    case 'Web':
      return 'panel-text-danger';
    case 'Movie':
      return 'panel-text-important';
    case 'OVA':
      return 'panel-text-warning';
    default:
      return 'panel-text-primary';
  }
};

const Item = ({ count, countPercentage, item }: { count: number, countPercentage: number, item: string }) => (
  <div>
    <div className="mb-1 flex">
      <span className="grow">
        {names[item] ?? item}
        &nbsp;-&nbsp;
        {count}
      </span>
      <span className={`text-${getColor(item)} font-semibold`}>
        {countPercentage.toFixed(2)}
        %
      </span>
    </div>
    <div className="flex rounded-lg bg-panel-input">
      <div className={`bg-${getColor(item)} h-4 rounded-lg`} style={{ width: `${countPercentage}%` }} />
    </div>
  </div>
);

const MediaType = () => {
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);
  const seriesSummaryQuery = useDashboardSeriesSummaryQuery();

  let total = 0;
  const seriesSummaryArray: [string, number][] = [];

  forEach(seriesSummaryQuery.data, (item, key) => {
    total += item ?? 0;
    seriesSummaryArray.push([key, item ?? 0]);
  });

  seriesSummaryArray.sort((summaryA, summaryB) => (summaryA[1] < summaryB[1] ? 1 : -1));

  const items: React.ReactNode[] = [];

  forEach(seriesSummaryArray, (item) => {
    let countPercentage = 0;
    if (total) {
      countPercentage = (item[1] / total) * 100;
    }
    items.push(<Item key={item[0]} item={item[0]} count={item[1]} countPercentage={countPercentage} />);
  });

  return (
    <ShokoPanel title="Media Type" isFetching={seriesSummaryQuery.isPending} editMode={layoutEditMode}>
      <div className="flex grow flex-col justify-between">{items}</div>
    </ShokoPanel>
  );
};

export default MediaType;
