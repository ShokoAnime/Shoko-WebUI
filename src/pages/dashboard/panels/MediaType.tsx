import React from 'react';
import { useSelector } from 'react-redux';
import cx from 'classnames';
import { forEach } from 'lodash';

import ShokoPanel from '@/components/Panels/ShokoPanel';
import { useDashboardSeriesSummaryQuery } from '@/core/react-query/dashboard/queries';

import type { RootState } from '@/core/store';

const names = {
  Series: 'TV Series',
};

const textColorMap = {
  Series: 'text-panel-text-primary',
  Other: 'text-panel-text-other',
  Web: 'text-panel-text-danger',
  Movie: 'text-panel-text-important',
  OVA: 'text-panel-text-warning',
} as Record<string, string>;

const bgColorMap = {
  Series: 'bg-panel-text-primary',
  Other: 'bg-panel-text-other',
  Web: 'bg-panel-text-danger',
  Movie: 'bg-panel-text-important',
  OVA: 'bg-panel-text-warning',
} as Record<string, string>;

const Item = ({ count, countPercentage, item }: { count: number, countPercentage: number, item: string }) => (
  <div>
    <div className="mb-1 flex">
      <span className="grow">
        {names[item] ?? item}
        &nbsp;-&nbsp;
        {count}
      </span>
      <span className={cx('font-semibold', textColorMap[item])}>
        {countPercentage.toFixed(2)}
        %
      </span>
    </div>
    <div className="flex rounded-lg bg-panel-input">
      <div className={cx('h-4 rounded-lg', bgColorMap[item])} style={{ width: `${countPercentage}%` }} />
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
