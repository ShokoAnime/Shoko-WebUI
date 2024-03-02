import React, { useMemo } from 'react';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
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

  const [itemWidth, itemHeight] = useMemo(() => {
    if (mode === 'poster') return [posterItemSize.width, posterItemSize.height, posterItemSize.gap];
    return [
      (isSeries || isSidebarOpen) ? listItemSize.widthAlt : listItemSize.width,
      listItemSize.height,
    ];
  }, [isSidebarOpen, mode, isSeries]);

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
          'flex grow rounded-lg items-center font-semibold justify-center max-h-screen',
          mode === 'poster' && 'px-6 py-6 bg-panel-background border-panel-border border',
        )}
      >
        <div className="flex w-full justify-center">
          {isFetching
            ? <Icon path={mdiLoading} size={3} className="text-panel-text-primary" spin />
            : 'No series/groups available!'}
        </div>
      </div>
    );
  }

  const renderItem = (item: CollectionGroupType | SeriesType, index: number) => {
    const isPlaceholder = index > total - 1;
    const baseStyle = { width: `${itemWidth / 16}rem` };

    if (isPlaceholder) {
      return <div style={baseStyle} />;
    }

    if (!item) {
      if (!isFetchingNextPage) fetchNextPageDebounced();
      return (
        <div
          className="flex shrink-0 items-center justify-center rounded-lg border border-panel-border text-panel-text-primary"
          style={{ ...baseStyle, height: `${itemHeight / 16}rem` }}
        >
          <Icon path={mdiLoading} spin size={3} />
        </div>
      );
    }

    const key = `group-${item.IDs.ID}`;
    return mode === 'poster' ? <PosterViewItem item={item} key={key} isSeries={isSeries} /> : (
      <ListViewItem
        item={item}
        groupExtras={!isSeries ? groupExtras.find(extra => extra.ID === item.IDs.ID) : undefined}
        key={key}
        isSeries={isSeries}
        isSidebarOpen={isSidebarOpen}
      />
    );
  };

  return (
    <div
      className={cx(
        'flex grow rounded-lg',
        mode === 'poster' ? 'px-6 py-6 w-min bg-panel-background border-panel-border border' : 'w-min',
      )}
    >
      <div className="relative w-full">
        <div className="flex flex-wrap gap-x-6 gap-y-4">
          {items.map(renderItem)}
        </div>
      </div>
    </div>
  );
};

export default CollectionView;
