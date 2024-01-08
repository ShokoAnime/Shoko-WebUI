import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';

import type { FilteredGroupSeriesRequestType, FilteredGroupsRequestType } from '@/core/react-query/filter/types';
import type { ListResultType } from '@/core/types/api';
import type { CollectionFilterType, CollectionGroupType } from '@/core/types/api/collection';
import type { FilterType } from '@/core/types/api/filter';
import type { SeriesType } from '@/core/types/api/series';

export const useFiltersQuery = (enabled = false) =>
  useQuery<ListResultType<CollectionFilterType>>({
    queryKey: ['filter', 'all'],
    queryFn: () => axios.get('Filter', { params: { pageSize: 0 } }),
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

export const useFilteredGroupsInfiniteQuery = ({ filterCriteria, ...params }: FilteredGroupsRequestType) =>
  useInfiniteQuery<ListResultType<CollectionGroupType>>({
    queryKey: ['filter', 'preview', 'groups', filterCriteria, params],
    queryFn: ({ pageParam }) =>
      axios.post(
        'Filter/Preview/Group',
        filterCriteria,
        {
          params: {
            ...params,
            // It is supposed to infer the type from the initialPageParam property but it doesn't work
            page: pageParam as number,
          },
        },
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, lastPageParam: number) => {
      if (!params.pageSize || lastPage.Total / params.pageSize <= lastPageParam) return undefined;
      return lastPageParam + 1;
    },
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
