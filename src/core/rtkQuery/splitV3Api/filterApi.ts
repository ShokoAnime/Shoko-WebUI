import {
  paginatedForceRefetch,
  paginatedQueryMerge,
  serializePaginatedQueryArgs,
  transformPaginatedResponse,
} from '@/core/rtkPaginationUtil';
import { splitV3Api } from '@/core/rtkQuery/splitV3Api';

import type { InfiniteResultType, PaginationType } from '@/core/types/api';
import type { CollectionGroupType } from '@/core/types/api/collection';
import type { FilterType } from '@/core/types/api/filter';
import type { SeriesType } from '@/core/types/api/series';

const filterApi = splitV3Api.injectEndpoints({
  endpoints: build => ({
    getFilter: build.query<FilterType, { filterId: string }>({
      query: ({ filterId }) => ({
        url: `Filter/${filterId}`,
        params: {
          withConditions: true,
        },
      }),
    }),

    getFilteredGroupsInfinite: build.query<
      InfiniteResultType<CollectionGroupType>,
      PaginationType & { randomImages?: boolean, filterCriteria: FilterType }
    >({
      query: ({ filterCriteria, ...params }) => ({
        url: 'Filter/Preview/Group',
        method: 'POST',
        params,
        body: filterCriteria,
      }),
      transformResponse: transformPaginatedResponse,
      serializeQueryArgs: serializePaginatedQueryArgs,
      merge: paginatedQueryMerge,
      forceRefetch: paginatedForceRefetch,
    }),

    getFilteredGroupSeries: build.query<
      InfiniteResultType<SeriesType>,
      { groupId: string, randomImages?: boolean, filterCriteria: FilterType }
    >({
      query: ({ filterCriteria, groupId, ...params }) => ({
        url: `Filter/Preview/Group/${groupId}/Series`,
        method: 'POST',
        params,
        body: filterCriteria,
      }),
      transformResponse: (response: SeriesType[]) => ({
        pages: {
          1: response,
        },
        total: response.length,
      }),
    }),
  }),
});

export const {
  useGetFilterQuery,
  useGetFilteredGroupSeriesQuery,
  useGetFilteredGroupsInfiniteQuery,
} = filterApi;
