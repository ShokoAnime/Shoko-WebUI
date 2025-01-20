import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { transformListResultSimplified } from '@/core/react-query/helpers';

import type { TagsRequestType } from '@/core/react-query/tag/types';
import type { ListResultType } from '@/core/types/api';
import type { TagType } from '@/core/types/api/tags';

export const useAniDBTagsQuery = (params: TagsRequestType, enabled = true) =>
  useQuery<ListResultType<TagType>, unknown, TagType[]>({
    queryKey: ['tags', 'anidb', params],
    queryFn: () => axios.get('Tag/AniDB', { params }),
    select: transformListResultSimplified,
    enabled,
  });

export const useUserTagsQuery = (params: TagsRequestType, enabled = true) =>
  useQuery<ListResultType<TagType>, unknown, TagType[]>({
    queryKey: ['tags', 'user', params],
    queryFn: () => axios.get('Tag/User', { params }),
    select: transformListResultSimplified,
    enabled,
  });

export const useSeriesUserTagsSetQuery = (seriesId: number, enabled = true) =>
  useQuery<TagType[], unknown, Set<number>>({
    queryKey: ['series', seriesId, 'tags', 'user'],
    queryFn: () => axios.get(`Series/${seriesId}/Tags/User`),
    select: data => new Set(data.map(tag => tag.ID)),
    enabled,
    initialData: [],
  });
