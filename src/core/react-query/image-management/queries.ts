import { useInfiniteQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';

import type { SeriesImageCrossReferencesRequestType } from '@/core/react-query/image-management/types';
import type { ListResultType } from '@/core/types/api';
import type { ImageCrossReferenceType } from '@/core/types/api/image';

/**
 * Fetch image cross-references for a series, filtered by image type.
 */
export const useSeriesImageCrossReferencesQuery = (
  seriesId: number,
  params: SeriesImageCrossReferencesRequestType,
  enabled: boolean,
) =>
  useInfiniteQuery<ListResultType<ImageCrossReferenceType>>({
    queryKey: ['image-management', 'cross-references', seriesId, params],
    queryFn: ({ pageParam }) =>
      axios.get(
        `Image/Management/CrossReference/Entity/Shoko/Series/${seriesId}`,
        {
          params: {
            ...params,
            includeImage: true,
            page: pageParam as number,
          },
        },
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      if (!params.pageSize || lastPage.Total / params.pageSize <= (lastPageParam as number)) return undefined;
      return (lastPageParam as number) + 1;
    },
    enabled: enabled && !!seriesId,
  });
