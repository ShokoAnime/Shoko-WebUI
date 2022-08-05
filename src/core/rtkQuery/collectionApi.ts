import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

import { CollectionFilterType, CollectionGroupType } from '../types/api/collection';
import { ListResultType, PaginationType } from '../types/api';
import { SeriesType } from '../types/api/series';

export const collectionApi = createApi({
  reducerPath: 'collectionApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v3/',
    prepareHeaders: (headers, { getState }) => {
      const apikey = (getState() as RootState).apiSession.apikey;
      headers.set('apikey', apikey);
      return headers;
    },
  }),
  endpoints: build => ({
    getGroups: build.query<ListResultType<Array<CollectionGroupType>>, PaginationType>({
      query: params => ({ url: 'Group', params }),
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
    getFilterGroups: build.query<ListResultType<Array<CollectionGroupType>>, { filterId?: string } & PaginationType>({
      query: ({ filterId, ...params }) => ({ url: `Filter/${filterId}/Group`, params }),
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
  useLazyGetFilterGroupsQuery,
  useGetFilterQuery,
} = collectionApi;