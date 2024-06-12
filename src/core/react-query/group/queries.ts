import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';

import type { GroupsInfiniteRequestType } from '@/core/react-query/group/types';
import type { ListResultType } from '@/core/types/api';
import type { CollectionGroupType } from '@/core/types/api/collection';
import type { SeriesType } from '@/core/types/api/series';

export const useGroupQuery = (groupId: number, enabled = true) =>
  useQuery<CollectionGroupType>({
    queryKey: ['group', groupId],
    queryFn: () => axios.get(`Group/${groupId}`),
    enabled,
  });

export const useGroupsInfiniteQuery = (params: GroupsInfiniteRequestType) =>
  useInfiniteQuery<ListResultType<CollectionGroupType>>({
    queryKey: ['groups', params],
    queryFn: ({ pageParam }) =>
      axios.get(
        'Group',
        {
          params: {
            ...params,
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

export const useGroupSeriesQuery = (groupId: number, enabled = true) =>
  useQuery<SeriesType[]>({
    queryKey: ['group-series', groupId],
    queryFn: () => axios.get(`Group/${groupId}/Series`),
    enabled,
  });
