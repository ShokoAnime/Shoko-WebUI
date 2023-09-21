import { defaultSerializeQueryArgs } from '@reduxjs/toolkit/query';
import { omit } from 'lodash';

import { splitV3Api } from '@/core/rtkQuery/splitV3Api';

import type { InfiniteResultType, ListResultType, PaginationType } from '@/core/types/api';
import type { CollectionFilterType, CollectionGroupType } from '@/core/types/api/collection';
import type { SeriesType } from '@/core/types/api/series';

const collectionApi = splitV3Api.injectEndpoints({
  endpoints: build => ({
    getGroups: build.query<InfiniteResultType<CollectionGroupType[]>, PaginationType & { filterId: string }>({
      query: ({ filterId, ...params }) => ({
        url: `Filter/${filterId}/Group`,
        params: { includeEmpty: true, ...params },
      }),
      transformResponse: (response: ListResultType<CollectionGroupType[]>, _, args) => ({
        pages: {
          [args.page ?? 1]: response.List,
        },
        total: response.Total,
      }),
      // Only have one cache entry because the arg always maps to one string
      serializeQueryArgs: ({ endpointDefinition, endpointName, queryArgs }) =>
        defaultSerializeQueryArgs({
          endpointName,
          queryArgs: omit(queryArgs, ['page']),
          endpointDefinition,
        }),
      // Always merge incoming data to the cache entry
      merge: (currentCache, newItems) => {
        const tempCache = { ...currentCache };
        tempCache.pages = { ...currentCache.pages, ...newItems.pages };
        return tempCache;
      },
      // Refetch when the page arg changes
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),
    getGroup: build.query<CollectionGroupType, { groupId: number }>({
      query: ({ groupId }) => ({ url: `Group/${groupId}` }),
    }),
    getGroupLetters: build.query<{ [index: string]: number }, { includeEmpty: boolean, topLevelOnly: boolean }>({
      query: ({ includeEmpty = false, topLevelOnly = true }) => ({
        url: 'Group/Letters',
        params: { includeEmpty, topLevelOnly },
      }),
    }),
    getGroupSeries: build.query<SeriesType[], { groupId?: string }>({
      query: ({ groupId }) => ({ url: `Group/${groupId}/Series` }),
    }),
    getTopFilters: build.query<ListResultType<CollectionFilterType[]>, PaginationType>({
      query: params => ({ url: 'Filter', params: { page: params.page ?? 1, pageSize: params.pageSize ?? 0 } }),
    }),
    getFilters: build.query<ListResultType<CollectionFilterType[]>, string>({
      query: filterId => ({ url: `Filter/${filterId}/Filter`, params: { page: 1, pageSize: 0 } }),
    }),
    getFilterGroupLetters: build.query<
      { [index: string]: number },
      { includeEmpty: boolean, topLevelOnly: boolean, filterId?: string }
    >({
      query: ({ filterId = '', includeEmpty = false, topLevelOnly = true }) => ({
        url: `Filter/${filterId}/Group/Letters`,
        params: { includeEmpty, topLevelOnly },
      }),
    }),
    getFilter: build.query<CollectionFilterType, { filterId?: string }>({
      query: ({ filterId }) => ({ url: `Filter/${filterId}` }),
    }),
  }),
});

export const {
  useGetFilterQuery,
  useGetGroupQuery,
  useGetGroupSeriesQuery,
  useLazyGetFiltersQuery,
  useLazyGetGroupsQuery,
  useLazyGetTopFiltersQuery,
} = collectionApi;
