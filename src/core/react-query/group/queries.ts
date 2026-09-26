import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { transformListResultSimplified } from '@/core/react-query/helpers';

import type { GroupsInfiniteRequestType } from '@/core/react-query/group/types';
import type { ListResultType } from '@/core/types/api';
import type { CollectionGroupType } from '@/core/types/api/collection';
import type { ImageType } from '@/core/types/api/common';
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

// `pageSize: 0` returns the full list (server `ToListResult` treats <= 0 as unpaginated).
// Convert to an infinite query (see `useSeriesImagesInfiniteQuery`) if the list grows large enough to need virtualization.
export const useGroupImagesQuery = (groupId: number, enabled = true) =>
  useQuery<ListResultType<ImageType>, unknown, ImageType[]>({
    queryKey: ['group', groupId, 'images', 'Primary'],
    queryFn: () => axios.get(`Group/${groupId}/Images/Primary`, { params: { pageSize: 0 } }),
    select: transformListResultSimplified,
    enabled: enabled && groupId !== -1,
  });
