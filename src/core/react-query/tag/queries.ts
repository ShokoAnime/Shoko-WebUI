import { useQuery } from '@tanstack/react-query';

import { GetTagAniDBResponse, GetTagUserResponse } from '@/core/api/generated/tag/tag';
import { axios } from '@/core/axios';
import { transformListResultSimplified } from '@/core/react-query/helpers';

import type { TagsRequestType } from '@/core/react-query/tag/types';

export const useAniDBTagsQuery = (params: TagsRequestType, enabled = true) =>
  useQuery({
    queryKey: ['tags', 'anidb', params],
    queryFn: () => axios.get('Tag/AniDB', { params, schema: GetTagAniDBResponse }),
    select: transformListResultSimplified,
    enabled,
  });

export const useUserTagsQuery = (params: TagsRequestType, enabled = true) =>
  useQuery({
    queryKey: ['tags', 'user', params],
    queryFn: () => axios.get('Tag/User', { params, schema: GetTagUserResponse }),
    select: transformListResultSimplified,
    enabled,
  });
