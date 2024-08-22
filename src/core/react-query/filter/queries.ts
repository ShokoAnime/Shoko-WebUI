import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { transformFilterExpressions } from '@/core/react-query/filter/helpers';

import type {
  FilteredGroupSeriesRequestType,
  FilteredGroupsRequestType,
  FilteredSeriesRequestType,
} from '@/core/react-query/filter/types';
import type { ListResultType } from '@/core/types/api';
import type { CollectionFilterType, CollectionGroupType } from '@/core/types/api/collection';
import type { FilterExpression, FilterType } from '@/core/types/api/filter';
import type { SeriesType } from '@/core/types/api/series';

export const useFiltersQuery = (enabled = false) =>
  useQuery<ListResultType<CollectionFilterType>>({
    queryKey: ['filter', 'all'],
    queryFn: () => axios.get('Filter', { params: { includeEmpty: true, pageSize: 0 } }),
    enabled,
  });

export const useFilterQuery = (filterId: number, enabled = true) =>
  useQuery<FilterType>({
    queryKey: ['filter', 'single', filterId],
    queryFn: () => axios.get(`Filter/${filterId}`, { params: { withConditions: true } }),
    enabled,
  });

export const useSubFiltersQuery = (filterId: number, enabled = false) =>
  useQuery<ListResultType<CollectionFilterType>>({
    queryKey: ['filter', 'sub', filterId],
    queryFn: () => axios.get(`Filter/${filterId}/Filter`, { params: { pageSize: 0 } }),
    enabled,
  });

export const useFilterExpressionsQuery = (enabled = true) =>
  useQuery<FilterExpression[]>({
    queryKey: ['filter', 'expression', 'all'],
    queryFn: () => axios.get('Filter/Expressions'),
    select: transformFilterExpressions,
    enabled,
    staleTime: Infinity, // This query does not return different results each time, so we can cache it forever.
  });

export const useFilteredSeriesInfiniteQuery = (
  { filterCriteria, ...params }: FilteredSeriesRequestType,
  enabled = true,
) =>
  useInfiniteQuery<ListResultType<SeriesType>>({
    queryKey: ['filter', 'preview', 'series', filterCriteria, params],
    queryFn: ({ pageParam }) =>
      axios.post(
        'Filter/Preview/Series',
        filterCriteria,
        {
          params: {
            ...params,
            page: pageParam,
          },
        },
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, lastPageParam: number) => {
      if (!params.pageSize || lastPage.Total / params.pageSize <= lastPageParam) return undefined;
      return lastPageParam + 1;
    },
    enabled,
  });

export const useFilteredGroupsInfiniteQuery = (
  { filterCriteria, ...params }: FilteredGroupsRequestType,
  enabled = true,
) =>
  useInfiniteQuery<ListResultType<CollectionGroupType>>({
    queryKey: ['filter', 'preview', 'groups', filterCriteria, params],
    queryFn: ({ pageParam }) =>
      axios.post(
        'Filter/Preview/Group',
        filterCriteria,
        {
          params: {
            ...params,
            page: pageParam,
          },
        },
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, lastPageParam: number) => {
      if (!params.pageSize || lastPage.Total / params.pageSize <= lastPageParam) return undefined;
      return lastPageParam + 1;
    },
    enabled,
  });

export const useFilteredGroupSeries = (
  groupId: number,
  { filterCriteria, ...params }: FilteredGroupSeriesRequestType,
  enabled = true,
) =>
  useQuery<SeriesType[]>({
    queryKey: ['filter', 'preview', 'group-series', groupId, filterCriteria, params],
    queryFn: () => axios.post(`Filter/Preview/Group/${groupId}/Series`, filterCriteria, { params }),
    enabled,
  });
