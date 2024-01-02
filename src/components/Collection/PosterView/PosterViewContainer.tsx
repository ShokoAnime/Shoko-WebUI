import React, { useMemo } from 'react';
import { useOutletContext } from 'react-router';
import useMeasure from 'react-use-measure';
import { mdiLoading } from '@mdi/js';
import Icon from '@mdi/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import cx from 'classnames';
import { debounce } from 'lodash';

import PosterViewItem from '@/components/Collection/PosterView/PosterViewItem';

import { posterItemSize } from './constant';

import type { CollectionGroupType } from '@/core/types/api/collection';
import type { SeriesType } from '@/core/types/api/series';

type Props = {
  fetchNextPage: () => Promise<unknown>;
  isFetchingNextPage: boolean;
  isFetching: boolean;
  isSeries: boolean;
  items: CollectionGroupType[] | SeriesType[];
  total: number;
};

const PosterViewContainer = (props: Props) => {
  const {
    fetchNextPage,
    isFetching,
    isFetchingNextPage,
    isSeries,
    items,
    total,
  } = props;

  const [itemWidth, itemHeight, itemGap] = useMemo(
    () => [posterItemSize.width, posterItemSize.height, posterItemSize.gap],
    [],
  );
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
      }, 50),
    [fetchNextPage],
  );

  if (total === 0) {
    return (
      <div
        className={cx(
          'flex grow rounded-md items-center font-semibold justify-center max-h-screen',
          'px-8 py-8 bg-panel-background border-panel-border border',
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
      className={cx('flex grow rounded-md', 'px-8 py-8 bg-panel-background border-panel-border border')}
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

          // Here, i will be the actual index of the group in group list
          for (let i = fromIndex; i < toIndex; i += 1) {
            const item = items[i];

            // Placeholder to solve formatting issues.
            // Used to fill the empty "slots" in the last row
            const isPlaceholder = i > total - 1;

            if (isPlaceholder) {
              children.push(
                <div
                  key={`placeholder-${i}`}
                  style={{
                    width: `${itemWidth / 16}rem`,
                  }}
                />,
              );

              // eslint-disable-next-line no-continue
              continue;
            }

            if (!item) {
              if (!isFetchingNextPage) fetchNextPageDebounced();
              children.push(
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
              // eslint-disable-next-line no-continue
              continue;
            }

            children.push(
              <PosterViewItem item={item} key={`group-${item.IDs.ID}`} isSeries={isSeries} />,
            );
          }

          return (
            <div
              className={cx('absolute top-0 left-0 w-full flex items-center justify-center last:pb-0', 'gap-x-4 pb-4')}
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

export default PosterViewContainer;
