import { splitV3Api } from '../splitV3Api';

import { CollectionFilterType, CollectionGroupType } from '@/core/types/api/collection';
import { ListResultType, PaginationType } from '@/core/types/api';
import { SeriesType } from '@/core/types/api/series';

const collectionApi = splitV3Api.injectEndpoints({
  endpoints: build => ({
    getGroups: build.query<ListResultType<Array<CollectionGroupType>>, PaginationType>({
      query: params => ({ url: 'Group', params }),
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
    getFilterGroups: build.query<ListResultType<Array<CollectionGroupType>>, { filterId?: string } & PaginationType>({
      query: ({ filterId, ...params }) => ({ url: `Filter/${filterId}/Group`, params }),
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
  useLazyGetFilterGroupsQuery,
  useGetFilterQuery,
  useGetGroupLettersQuery,
  useGetFilterGroupLettersQuery,
  useGetGroupQuery,
} = collectionApi;
