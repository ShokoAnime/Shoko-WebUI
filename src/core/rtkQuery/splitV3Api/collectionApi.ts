import { defaultSerializeQueryArgs } from '@reduxjs/toolkit/query';
import { omit } from 'lodash';

import { splitV3Api } from '../splitV3Api';

import { CollectionFilterType, CollectionGroupType } from '@/core/types/api/collection';
import { InfiniteResultType, ListResultType, PaginationType } from '@/core/types/api';
import { SeriesType } from '@/core/types/api/series';

const collectionApi = splitV3Api.injectEndpoints({
  endpoints: build => ({
    getGroups: build.query<InfiniteResultType<CollectionGroupType[]>, PaginationType & { filterId: string }>({
      query: ({ filterId, ...params }) => ({ url: `Filter/${filterId}/Group`, params }),
      transformResponse: (response: ListResultType<CollectionGroupType[]>, _, args) => {
        return {
          pages: {
            [args.page ?? 1]: response.List,
          },
          total: response.Total,
        };
      },
      // Only have one cache entry because the arg always maps to one string
      serializeQueryArgs: ({ endpointName, queryArgs, endpointDefinition }) =>
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
    getGroupLetters: build.query<{ [index: string]: number }, { includeEmpty: boolean; topLevelOnly: boolean; }>({
      query: ({ includeEmpty = false, topLevelOnly = true }) => ({ url: 'Group/Letters', params: { includeEmpty, topLevelOnly } }),
    }),
    getGroupSeries: build.query<Array<SeriesType>, { groupId?: string }>({
      query: ({ groupId }) => ({ url: `Group/${groupId}/Series` }),
    }),
    getTopFilters: build.query<ListResultType<Array<CollectionFilterType>>, PaginationType>({
      query: params => ({ url: 'Filter', params: { page: params.page ?? 1, pageSize: params.pageSize ?? 0 } }),
    }),
    getFilters: build.query<ListResultType<Array<CollectionFilterType>>, string>({
      query: filterId => ({ url: `Filter/${filterId}/Filter`, params: { page: 1, pageSize: 0 } }),
    }),
    getFilterGroupLetters: build.query<{ [index: string]: number }, { includeEmpty: boolean; topLevelOnly: boolean; filterId?: string }>({
      query: ({ includeEmpty = false, topLevelOnly = true, filterId = '' }) => ({ url: `Filter/${filterId}/Group/Letters`, params: { includeEmpty, topLevelOnly } }),
    }),
    getFilter: build.query<CollectionFilterType, { filterId?: string }>({
      query: ({ filterId }) => ({ url: `Filter/${filterId}` }),
    }),
  }),
});

export const {
  useLazyGetGroupsQuery,
  useGetGroupSeriesQuery,
  useLazyGetTopFiltersQuery,
  useLazyGetFiltersQuery,
  useGetFilterQuery,
  useGetGroupQuery,
} = collectionApi;
