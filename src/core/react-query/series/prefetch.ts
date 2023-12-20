import { axios } from '@/core/axios';
import queryClient from '@/core/react-query/queryClient';
import { getSeriesEpisodesQueryKey, getSeriesFilesQueryKey } from '@/core/react-query/series/helpers';

import type { SeriesEpisodesInfiniteRequestType } from '@/core/react-query/series/types';
import type { FileRequestType } from '@/core/react-query/types';

export const prefetchSeriesFilesQuery = async (seriesId: number, params: FileRequestType) => {
  await queryClient.prefetchQuery({
    queryKey: getSeriesFilesQueryKey(seriesId, params),
    queryFn: () => axios.get(`Series/${seriesId}/File`, { params }),
    staleTime: 60000,
  });
};

export const prefetchSeriesEpisodesInfiniteQuery = async (
  seriesId: number,
  params: SeriesEpisodesInfiniteRequestType,
) => {
  await queryClient.prefetchInfiniteQuery({
    queryKey: getSeriesEpisodesQueryKey(seriesId, params),
    queryFn: ({ pageParam }) =>
      axios.get(
        `Series/${seriesId}/Episode`,
        {
          params: {
            ...params,
            page: pageParam,
          },
        },
      ),
    initialPageParam: 1,
    staleTime: 60000,
  });
};
