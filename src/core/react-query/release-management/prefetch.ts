import { axios } from '@/core/axios';
import queryClient from '@/core/react-query/queryClient';

import type { SeriesEpisodesWithMultipleReleasesType } from '@/core/react-query/release-management/types';

export const prefetchSeriesEpisodesWithMultipleReleasesQuery = async (
  seriesId: number,
  params: SeriesEpisodesWithMultipleReleasesType,
) => {
  await queryClient.prefetchQuery({
    queryKey: ['release-management', 'series', 'episodes', seriesId, params],
    queryFn: () =>
      axios.get(
        `ReleaseManagement/Series/${seriesId}`,
        {
          params: {
            ...params,
            pageSize: 0, // As we are not using infinite reload for this
          },
        },
      ),
    staleTime: 60000,
  });
};
