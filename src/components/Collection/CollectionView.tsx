import React, { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import useMeasure from 'react-use-measure';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import cx from 'classnames';

import ListViewItem from '@/components/Collection/ListViewItem';
import PosterViewItem from '@/components/Collection/PosterViewItem';

import type { CollectionGroupType } from '@/core/types/api/collection';
import type { SeriesType } from '@/core/types/api/series';
import type { WebuiGroupExtra } from '@/core/types/api/webui';

type Props = {
  groupExtras: WebuiGroupExtra[];
  isFetching: boolean;
  isSeries: boolean;
  isSidebarOpen: boolean;
  mode: string;
  pageSize: number;
  pages: Record<number, CollectionGroupType[] | SeriesType[]>;
  setCurrentPage: (page: number) => void;
  total: number;
};

export const posterItemSize = {
  width: 209,
  height: 363,
  gap: 16,
};

export const listItemSize = {
  width: 907,
  height: 328,
  widthAlt: 907,
  gap: 32,
};

const CollectionView = (props: Props) => {
  const {
    groupExtras,
    isFetching,
    isSeries,
    isSidebarOpen,
    mode,
    pageSize,
    pages,
    setCurrentPage,
    total,
  } = props;

  const [itemWidth, itemHeight, itemGap] = useMemo(() => {
    if (mode === 'poster') return [posterItemSize.width, posterItemSize.height, posterItemSize.gap];
    return [
      (isSeries || isSidebarOpen) ? listItemSize.widthAlt : listItemSize.width,
      listItemSize.height,
      listItemSize.gap,
    ];
  }, [isSidebarOpen, mode, isSeries]);

  const { scrollRef } = useOutletContext<{ scrollRef: React.RefObject<HTMLDivElement> }>();

  const [gridContainerRef, gridContainerBounds] = useMeasure();

  const [itemsPerRow, count] = useMemo(() => {
    // + 4 is to account for scrollbar, otherwise only 7 items show up in a row at max width
    const tempItemsPerRow = Math.max(1, Math.floor((gridContainerBounds.width + itemGap + 4) / (itemWidth + itemGap)));
    const tempCount = Math.ceil(total / tempItemsPerRow);
    return [tempItemsPerRow, tempCount];
  }, [gridContainerBounds.width, itemGap, itemWidth, total]);

  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => itemHeight + itemGap,
    overscan: 2,
  });

  if (total === 0) {
    return (
      <div
        className={cx(
          'flex grow rounded-md items-center font-semibold justify-center',
          mode === 'poster' && 'px-8 py-8 bg-panel-background border-panel-border border',
        )}
      >
        <div className="flex w-full justify-center" ref={gridContainerRef}>
          {isFetching
            ? <Icon path={mdiLoading} size={3} className="text-panel-text-primary" spin />
            : 'No series/groups available!'}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cx(
        'flex grow rounded-md',
        mode === 'poster' && 'px-8 py-8 bg-panel-background border-panel-border border',
      )}
    >
      <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }} ref={gridContainerRef}>
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

          const groupList1 = pages[neededPage1];
          const groupList2 = pages[neededPage2];

          if (groupList1 === undefined && !isFetching) {
            setCurrentPage(neededPage1);
          }

          if (groupList2 === undefined && !isFetching) {
            setCurrentPage(neededPage2);
          }

          // Here, i will be the actual index of the group in group list
          for (let i = fromIndex; i < toIndex; i += 1) {
            const neededPage = Math.ceil((i + 1) / pageSize);
            const relativeIndex = i % pageSize;
            const groupList = pages[neededPage];

            const item = groupList !== undefined ? groupList[relativeIndex] : undefined;

            // Placeholder to solve formatting issues.
            // Used to fill the empty "slots" in the last row
            const isPlaceholder = i > total - 1;

            if (isPlaceholder) {
              items.push(
                <div
                  key={`placeholder-${i}`}
                  style={{
                    width: `${itemWidth / 16}rem`,
                  }}
                />,
              );
            } else if (!item) {
              items.push(
                <div
                  className="flex shrink-0 items-center justify-center rounded-md border border-panel-border text-panel-text-primary"
                  key={`loading-${i}`}
                  style={{
                    width: `${itemWidth / 16}rem`,
                    height: `${itemHeight / 16}rem`,
                  }}
                >
                  <Icon path={mdiLoading} spin size={3} />
                </div>,
              );
            } else if (mode === 'poster') {
              items.push(
                <PosterViewItem item={item} key={`group-${item.IDs.ID}`} isSeries={isSeries} />,
              );
            } else {
              items.push(
                <ListViewItem
                  item={item}
                  groupExtras={!isSeries
                    ? groupExtras.find(extra => extra.ID === item.IDs.ID)
                    : undefined}
                  key={`group-${item.IDs.ID}`}
                  isSeries={isSeries}
                  isSidebarOpen={isSidebarOpen}
                />,
              );
            }
          }

          return (
            <div
              className={cx(
                'absolute top-0 left-0 w-full flex items-center justify-center last:pb-0',
                mode === 'poster'
                  ? 'gap-x-4 pb-4'
                  : 'gap-x-8 pb-8',
              )}
              style={{
                transform: `translateY(${virtualRow.start}px)`,
              }}
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
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
