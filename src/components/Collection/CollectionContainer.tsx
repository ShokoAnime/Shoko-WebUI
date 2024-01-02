import React from 'react';

import ListViewContainer from './ListView/ListViewContainer';
import PosterViewContainer from './PosterView/PosterViewContainer';

import type { CollectionGroupType } from '@/core/types/api/collection';
import type { SeriesType } from '@/core/types/api/series';

export type Props = {
  mode: string;
  isFetching: boolean;
  isFetchingNextPage: boolean;
  total: number;
  isSeries: boolean;
  isSidebarOpen: boolean;
  items: CollectionGroupType[] | SeriesType[];
  fetchNextPage: () => Promise<unknown>;
};

const CollectionContainerView = (props: Props) => {
  const {
    fetchNextPage,
    isFetching,
    isFetchingNextPage,
    isSeries,
    isSidebarOpen,
    items,
    mode,
    total,
  } = props;

  if (mode === 'poster') {
    return (
      <PosterViewContainer
        fetchNextPage={fetchNextPage}
        isFetching={isFetching}
        isFetchingNextPage={isFetchingNextPage}
        items={items}
        total={total}
        isSeries={isSeries}
      />
    );
  }
  return (
    <ListViewContainer
      fetchNextPage={fetchNextPage}
      isFetching={isFetching}
      isFetchingNextPage={isFetchingNextPage}
      isSeries={isSeries}
      isSidebarOpen={isSidebarOpen}
      items={items}
      total={total}
    />
  );
};

export default CollectionContainerView;
