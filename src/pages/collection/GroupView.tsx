import React, { useMemo } from 'react';
import { useParams } from 'react-router';
import useMeasure from 'react-use-measure';
import { chunk } from 'lodash';

import CollectionTitle from '@/components/Collection/CollectionTitle';
import GridViewItem from '@/components/Collection/GridViewItem';
import { useGetGroupQuery, useGetGroupSeriesQuery } from '@/core/rtkQuery/splitV3Api/collectionApi';

import type { SeriesType } from '@/core/types/api/series';

const itemWidth = 209 + 16;

const GroupView = () => {
  const { groupId } = useParams();

  const group = useGetGroupQuery({ groupId: Number(groupId) }, { skip: !groupId });
  const series = useGetGroupSeriesQuery({ groupId }, { skip: !groupId });
  const seriesInGroup = useMemo(() => series?.data ?? [] as Array<SeriesType>, [series]);

  const [gridContainerRef, gridContainerBounds] = useMeasure();
  const itemsPerRow = Math.max(1, Math.floor((gridContainerBounds.width - 40) / itemWidth));
  const seriesRows = useMemo(() => chunk(seriesInGroup, itemsPerRow), [itemsPerRow, seriesInGroup]);

  // Placeholder to solve formatting issues, same as CollectionView
  const placeholderItems = useMemo(() => {
    if (!seriesRows.length) return [];
    const placeholderDeficit = itemsPerRow - seriesRows[seriesRows.length - 1].length;
    const items = [] as React.ReactNode[];
    for (let i = 0; i < placeholderDeficit; i += 1) {
      items.push(<div className="w-[13.0625rem]" key={`placeholder-${i}`} />);
    }
    return items;
  }, [itemsPerRow, seriesRows]);

  return (
    <div className="flex grow flex-col gap-y-8">
      <div className="flex items-center justify-between rounded-md border border-panel-border bg-panel-background px-8 py-10">
        <CollectionTitle count={seriesInGroup.length} filterOrGroup={group.data?.Name} />
      </div>
      <div
        className="flex grow flex-col items-center gap-y-4 rounded-md border border-panel-border bg-panel-background p-8"
        ref={gridContainerRef}
      >
        {seriesRows.map((row, idx) => (
          <div
            className="flex gap-x-4"
            // eslint-disable-next-line react/no-array-index-key
            key={`row-${idx}`}
          >
            {row.map(item => <GridViewItem item={item} isSeries key={`series-${item.IDs.ID}`} />)}
            {idx === (seriesRows.length - 1) && placeholderItems}
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(GroupView);
