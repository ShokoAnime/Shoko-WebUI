import React, { useMemo } from 'react';
import { useParams } from 'react-router';

import CollectionTitle from '@/components/Collection/CollectionTitle';
import GridViewItem from '@/components/Collection/GridViewItem';
import { useGetGroupQuery, useGetGroupSeriesQuery } from '@/core/rtkQuery/splitV3Api/collectionApi';

import type { SeriesType } from '@/core/types/api/series';

const GroupView = () => {
  const { groupId } = useParams();

  const group = useGetGroupQuery({ groupId: Number(groupId) }, { skip: !groupId });
  const series = useGetGroupSeriesQuery({ groupId }, { skip: !groupId });
  const seriesInGroup = useMemo(() => series?.data ?? [] as Array<SeriesType>, [series?.data]);

  return (
    <div className="flex grow flex-col gap-y-8">
      <div className="flex items-center justify-between rounded-md border border-panel-border bg-panel-background px-8 py-10">
        <CollectionTitle count={seriesInGroup.length} filterOrGroup={group.data?.Name} />
      </div>
      <div className="flex grow flex-wrap justify-between gap-4 border border-panel-border bg-panel-background px-7 py-8">
        {seriesInGroup.map(item => <GridViewItem item={item} isSeries key={`series-${item.IDs.ID}`} />)}
      </div>
    </div>
  );
};

export default React.memo(GroupView);
