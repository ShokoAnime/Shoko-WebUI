import React, { useMemo } from 'react';
import { useOutletContext } from 'react-router';
import useMeasure from 'react-use-measure';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import cx from 'classnames';
import { debounce } from 'lodash';

import ListViewItem from '@/components/Collection/ListViewItem';
import PosterViewItem from '@/components/Collection/PosterViewItem';
import { listItemSize, posterItemSize } from '@/components/Collection/constants';

import type { CollectionGroupType } from '@/core/types/api/collection';
import type { SeriesType } from '@/core/types/api/series';
import type { WebuiGroupExtra } from '@/core/types/api/webui';

type Props = {
  groupExtras: WebuiGroupExtra[];
  fetchNextPage: () => Promise<unknown>;
  isFetchingNextPage: boolean;
  isFetching: boolean;
  isSeries: boolean;
  isSidebarOpen: boolean;
  items: CollectionGroupType[] | SeriesType[];
  mode: string;
  total: number;
};

const CollectionView = (props: Props) => {
  const {
    fetchNextPage,
    groupExtras,
    isFetching,
    isFetchingNextPage,
    isSeries,
    isSidebarOpen,
    items,
    mode,
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
  const virtualItems = virtualizer.getVirtualItems();

  const fetchNextPageDebounced = useMemo(
    () =>
      debounce(() => {
        fetchNextPage().catch(() => {});
      }, 100),
    [fetchNextPage],
  );

  if (total === 0) {
    return (
      <div
        className={cx(
          'flex grow rounded-lg items-center font-semibold justify-center max-h-screen',
          mode === 'poster' && 'px-6 py-6 bg-panel-background border-panel-border border',
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
        'flex grow rounded-lg',
        mode === 'poster' && 'px-6 py-6 bg-panel-background border-panel-border border',
      )}
    >
      <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }} ref={gridContainerRef}>
        {/* Each row is considered a virtual item here instead of each group */}
        {virtualItems.map((virtualRow) => {
          const children: React.ReactNode[] = [];

          // index of the first group in the current row
          // eg., row 2 (index = 1) at 1080p (itemsPerRow = 8)
          // will have fromIndex as 8, meaning first group in row 2 is 8th in the group list
          const fromIndex = virtualRow.index * itemsPerRow;
          // index of the last group in the current row + 1
          // same eg. as above, this will 16
          const toIndex = fromIndex + itemsPerRow;

          // Here, index will be the actual index of the group in group list
          for (let index = fromIndex; index < toIndex; index += 1) {
            const item = items[index];

            // Placeholder to solve formatting issues.
            // Used to fill the empty "slots" in the last row
            const isPlaceholder = index > total - 1;

            if (isPlaceholder) {
              children.push(
                <div
                  key={`placeholder-${index}`}
                  style={{
                    width: `${itemWidth / 16}rem`,
                  }}
                />,
              );
            } else if (!item) {
              if (!isFetchingNextPage) fetchNextPageDebounced();
              children.push(
                <div
                  className="flex shrink-0 items-center justify-center rounded-lg border border-panel-border text-panel-text-primary"
                  key={`loading-${index}`}
                  style={{
                    width: `${itemWidth / 16}rem`,
                    height: `${itemHeight / 16}rem`,
                  }}
                >
                  <Icon path={mdiLoading} spin size={3} />
                </div>,
              );
            } else if (mode === 'poster') {
              children.push(
                <PosterViewItem
                  key={`group-${item.IDs.ID}`}
                  item={item}
                  isSeries={isSeries}
                />,
              );
            } else {
              children.push(
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
                  ? 'gap-x-6 pb-4'
                  : 'gap-x-6 pb-8',
              )}
              style={{
                transform: `translateY(${virtualRow.start}px)`,
              }}
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
            >
              {children}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CollectionView;
