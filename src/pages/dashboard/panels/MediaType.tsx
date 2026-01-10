import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { forEach } from 'lodash';

import ShokoPanel from '@/components/Panels/ShokoPanel';
import { useDashboardSeriesSummaryQuery } from '@/core/react-query/dashboard/queries';

import type { RootState } from '@/core/store';

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
      return 'panel-text-other';
  }
};

const Item = ({
  count,
  countPercentage,
  displayName,
  item,
}: {
  count: number;
  countPercentage: number;
  item: string;
  displayName: string;
}) => (
  <div>
    <div className="mb-1 flex">
      <span className="grow">
        {displayName}
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
  const { t } = useTranslation('panels');
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);
  const seriesSummaryQuery = useDashboardSeriesSummaryQuery();

  let total = 0;
  const seriesSummaryArray: [string, number][] = [];

  forEach(seriesSummaryQuery.data, (item, key) => {
    total += item ?? 0;
    seriesSummaryArray.push([key, item ?? 0]);
  });

  seriesSummaryArray.sort((summaryA, summaryB) => (summaryA[1] < summaryB[1] ? 1 : -1));

  const items = seriesSummaryArray.map((item) => {
    const typeKey = item[0];
    const countPercentage = total ? (item[1] / total) * 100 : 0;
    const displayName = t(`mediaType.${typeKey.toLowerCase()}`) ?? typeKey;

    return (
      <Item
        key={typeKey}
        item={typeKey}
        count={item[1]}
        countPercentage={countPercentage}
        displayName={displayName}
      />
    );
  });
  return (
    <ShokoPanel title={t('mediaType.panelTitle')} isFetching={seriesSummaryQuery.isPending} editMode={layoutEditMode}>
      <div className="flex grow flex-col justify-between">{items}</div>
    </ShokoPanel>
  );
};

export default MediaType;
