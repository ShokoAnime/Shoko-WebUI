import {
  paginatedForceRefetch,
  paginatedQueryMerge,
  serializePaginatedQueryArgs,
  transformPaginatedResponse,
} from '@/core/rtkPaginationUtil';
import { splitV3Api } from '@/core/rtkQuery/splitV3Api';

import type { InfiniteResultType, ListResultType, PaginationType } from '@/core/types/api';
import type { CollectionFilterType, CollectionGroupType } from '@/core/types/api/collection';

const collectionApi = splitV3Api.injectEndpoints({
  endpoints: build => ({
    getGroup: build.query<CollectionGroupType, { groupId: string }>({
      query: ({ groupId }) => ({ url: `Group/${groupId}` }),
    }),

    getGroupInfinite: build.query<
      InfiniteResultType<CollectionGroupType>,
      PaginationType & { randomImages?: boolean, startsWith?: string, topLevelOnly?: boolean, includeEmpty?: boolean }
    >({
      query: ({ ...params }) => ({
        url: 'Group',
        params: { ...params },
      }),
      transformResponse: transformPaginatedResponse,
      serializeQueryArgs: serializePaginatedQueryArgs,
      merge: paginatedQueryMerge,
      forceRefetch: paginatedForceRefetch,
    }),

    getTopFilters: build.query<ListResultType<CollectionFilterType>, PaginationType>({
      query: params => ({ url: 'Filter', params: { page: params.page ?? 1, pageSize: params.pageSize ?? 0 } }),
    }),

    getFilters: build.query<ListResultType<CollectionFilterType>, string>({
      query: filterId => ({ url: `Filter/${filterId}/Filter`, params: { page: 1, pageSize: 0 } }),
    }),
  }),
});

export const {
  useGetGroupInfiniteQuery,
  useGetGroupQuery,
  useLazyGetFiltersQuery,
  useLazyGetGroupInfiniteQuery,
  useLazyGetTopFiltersQuery,
} = collectionApi;
