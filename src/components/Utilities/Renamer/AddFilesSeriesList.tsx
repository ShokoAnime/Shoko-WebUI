import React, { useMemo, useRef } from 'react';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { debounce } from 'lodash';

import { axios } from '@/core/axios';
import queryClient from '@/core/react-query/queryClient';
import { addFiles } from '@/core/slices/utilities/renamer';
import store from '@/core/store';

import type { ListResultType } from '@/core/types/api';
import type { FileType } from '@/core/types/api/file';
import type { SeriesType } from '@/core/types/api/series';

type Props = {
  fetchNextPage: () => Promise<unknown>;
  isFetchingNextPage: boolean;
  isPending: boolean;
  series: SeriesType[];
  seriesCount: number;
};

const addSeriesFiles = (seriesId: number) => {
  if (!seriesId) return;
  queryClient.fetchQuery<ListResultType<FileType>>(
    {
      queryKey: ['series', seriesId, 'files'],
      queryFn: () => axios.get(`Series/${seriesId}/File`),
    },
  )
    .then(result => store.dispatch(addFiles(result.List)))
    .catch(console.error);
};

const AddFilesSeriesList = (props: Props) => {
  const { fetchNextPage, isFetchingNextPage, isPending, series, seriesCount } = props;

  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: seriesCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 28,
    overscan: 10,
  });
  const virtualItems = virtualizer.getVirtualItems();

  const fetchNextPageDebounced = useMemo(
    () =>
      debounce(() => {
        fetchNextPage().catch(() => {});
      }, 50),
    [fetchNextPage],
  );

  return (
    <div className="flex h-48 grow rounded-lg bg-panel-input p-4">
      <div
        className="relative size-full overflow-y-auto bg-panel-input"
        ref={scrollRef}
      >
        <div className="absolute top-0 w-full" style={{ height: virtualizer.getTotalSize() }}>
          <div
            className="absolute left-0 top-0 w-full"
            style={{ transform: `translateY(${virtualItems[0]?.start ?? 0}px)` }}
          >
            {isPending && (
              <div className="mt-12 flex w-full justify-center text-panel-text-primary">
                <Icon path={mdiLoading} spin size={2} />
              </div>
            )}
            {!isPending && virtualItems.map((virtualRow) => {
              const item = series[virtualRow.index];

              if (!item && !isFetchingNextPage) fetchNextPageDebounced();

              return (
                <div
                  key={item ? item.IDs.ID : `loading-${virtualRow.key}`}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  className="line-clamp-1 flex cursor-pointer items-center justify-between pb-2 leading-tight hover:text-panel-text-primary"
                  onClick={() => addSeriesFiles(item?.IDs.ID)}
                >
                  {item ? item.Name : <Icon path={mdiLoading} spin size={1} className="text-panel-text-primary" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFilesSeriesList;
