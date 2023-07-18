import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useOutletContext } from 'react-router-dom';
import { useVirtualizer } from '@tanstack/react-virtual';
import useMeasure from 'react-use-measure';
import { Icon } from '@mdi/react';
import { mdiLoading } from '@mdi/js';
import cx from 'classnames';
import { debounce } from 'lodash';

import GridViewItem from '@/components/Collection/GridViewItem';
import CardViewItem from '@/components/Collection/CardViewItem';
import { useLazyGetGroupsQuery } from '@/core/rtkQuery/splitV3Api/collectionApi';
import { useLazyGetGroupViewQuery } from '@/core/rtkQuery/splitV3Api/webuiApi';

type Props = {
  mode: string;
  setGroupTotal: (total: number) => void;
};

const pageSize = 50;

const CollectionView = (props: Props) => {
  const { mode, setGroupTotal } = props;

  const { filterId } = useParams();

  const [itemWidth, itemHeight, itemGap] = useMemo(() => {
    // Gaps are intentionally left with + notation to remove the need for calculations if dimensions are being changed
    if (mode === 'grid') return [209 + 16, 337 + 16, 16]; // + 16 is to account for gap/margin
    return [907 + 32, 328 + 32, 32]; // + 32 is to account for gap/margin
  }, [mode]);

  const [fetchingPage, setFetchingPage] = useState(false);

  const [fetchGroups, groupsData] = useLazyGetGroupsQuery();
  const groupPages = groupsData.data?.pages ?? {};
  const groupTotal = groupsData.data?.total ?? 0;

  const [fetchGroupExtras, groupExtrasData] = useLazyGetGroupViewQuery();
  const groupExtras = groupExtrasData.data ?? [];

  useEffect(() => {
    setGroupTotal(groupTotal);
  }, [groupTotal, setGroupTotal]);

  const fetchPage = useMemo(() => debounce((page: number) => {
    fetchGroups({ page, pageSize, filterId: filterId ?? '0' }).then((result) => {
      if (!result.data) return;

      const ids = result.data.pages[page].map(group => group.IDs.ID);
      fetchGroupExtras({
        GroupIDs: ids,
        TagFilter: 128,
        TagLimit: 20,
        OrderByName: true,
      }).then().catch(error => console.error(error));
    }).catch(error => console.error(error)).finally(() => setFetchingPage(false));
  }, 200), [filterId, fetchGroups, fetchGroupExtras]);

  useEffect(() => {
    fetchPage.cancel();
    setFetchingPage(false);

    fetchPage(1);

    return () => fetchPage.cancel();
  }, [filterId, fetchPage]);

  const { scrollRef } = useOutletContext<{ scrollRef: React.RefObject<HTMLDivElement> }>();

  const [gridContainerRef, gridContainerBounds] = useMeasure();

  const itemsPerRow = Math.max(1, Math.floor((gridContainerBounds.width + itemGap) / itemWidth));
  const count = useMemo(() => Math.ceil(groupTotal / itemsPerRow), [groupTotal, itemsPerRow]);

  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => itemHeight,
    overscan: 2,
  });

  if (groupTotal === 0) {
    return (
      <div className={cx(
        'flex grow rounded-md items-center font-semibold justify-center',
        mode === 'grid' && 'px-6 py-8 bg-background-alt border-background-border border',
      )}
      >
        {groupsData.isUninitialized || groupsData.isLoading ? (
          <Icon path={mdiLoading} size={3} className="text-highlight-1" spin />
        ) : 'No series/groups available!'}
      </div>
    );
  }

  return (
    <div className={cx(
      'flex grow rounded-md',
      mode === 'grid' && 'px-6 py-8 bg-background-alt border-background-border border',
    )}
    >
      <div className="w-full relative" style={{ height: virtualizer.getTotalSize() }} ref={gridContainerRef}>
        {/* Each row is considered a virtual item here instead of each group */}
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const { index } = virtualRow;

          const items: React.ReactNode[] = [];
          // index of the first group in the current row
          // eg., row 2 (index = 1) at 1080p (itemsPerRow = 8)
          // will have fromIndex as 8, meaning first group in row 2 is 8th in the group list
          const fromIndex = index * itemsPerRow;
          // index of the last group in the current row + 1
          // same eg. as above, this will 16
          const toIndex = fromIndex + itemsPerRow;

          const neededPage1 = Math.ceil((fromIndex + 1) / pageSize);
          const neededPage2 = Math.ceil(toIndex / pageSize);

          const groupList1 = groupPages[neededPage1];
          const groupList2 = groupPages[neededPage2];

          if (groupList1 === undefined && !fetchingPage) {
            setFetchingPage(true);
            fetchPage(neededPage1);
          }

          if (groupList2 === undefined && !fetchingPage) {
            setFetchingPage(true);
            fetchPage(neededPage2);
          }

          // Here, i will be the actual index of the group in group list
          for (let i = fromIndex; i < toIndex; i += 1) {
            const neededPage = Math.ceil((i + 1) / pageSize);
            const relativeIndex = i % pageSize;
            const groupList = groupPages[neededPage];

            const item = groupList !== undefined ? groupList[relativeIndex] : undefined;

            // Placeholder to solve formatting issues.
            // Used to fill the empty "slots" in the last row
            const isPlaceholder = i > groupTotal - 1;

            if (isPlaceholder) {
              items.push(<div className={cx(mode === 'grid' ? 'w-[13.0625rem]' : 'w-[56.6875rem]')} key={`placeholder-${i}`} />);
            } else if (item) {
              items.push(
                mode === 'grid'
                  ? GridViewItem(item)
                  : CardViewItem(item, groupExtras.find(extra => extra.ID === item.IDs.ID)),
              );
            } else {
              items.push(
                <div
                  className={cx(
                    'flex items-center justify-center text-highlight-1 shrink-0 rounded-md border border-background-border',
                    mode === 'grid' ? 'w-[13.0625rem] h-[21.0625rem]' : 'w-[56.6875rem] h-[20.5rem]',
                  )}
                  key={`loading-${i}`}
                >
                  <Icon path={mdiLoading} spin size={3} />
                </div>,
              );
            }
          }

          return (
            <div
              className={cx(
                'absolute top-0 left-0 w-full flex items-center justify-center last:mb-0',
                mode === 'grid' ? 'h-[21.0625rem] gap-x-4 mb-4' : 'h-[20.5rem] gap-x-8 mb-8',
              )}
              style={{ transform: `translateY(${virtualRow.start}px)` }}
              key={virtualRow.key}
              data-index={virtualRow.index}
            >
              {items}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CollectionView;
