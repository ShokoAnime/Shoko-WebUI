import { useInfiniteQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';

import type { SeriesWithMultipleReleasesRequestType } from '@/core/react-query/release-management/types';
import type { ListResultType } from '@/core/types/api';
import type { SeriesWithMultipleReleasesType } from '@/core/types/api/series';

export const useSeriesWithMultipleReleases = (params: SeriesWithMultipleReleasesRequestType) =>
  useInfiniteQuery<ListResultType<SeriesWithMultipleReleasesType>>({
    queryKey: ['release-management', 'series', params],
    queryFn: ({ pageParam }) =>
      axios.get(
        'ReleaseManagement/Series',
        {
          params: {
            ...params,
            // It is supposed to infer the type from the initialPageParam property but it doesn't work
            page: pageParam as number,
          },
        },
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, lastPageParam: number) => {
      if (!params.pageSize || lastPage.Total / params.pageSize <= lastPageParam) return undefined;
      return lastPageParam + 1;
    },
  });
