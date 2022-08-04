import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

import { CollectionGroupType } from '../types/api/collection';
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
  }),
});

export const {
  useLazyGetGroupsQuery,
  useGetGroupSeriesQuery,
} = collectionApi;