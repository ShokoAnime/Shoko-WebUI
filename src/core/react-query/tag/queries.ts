import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { transformListResultSimplified } from '@/core/react-query/helpers';

import type { TagsRequestType } from '@/core/react-query/tag/types';
import type { ListResultType } from '@/core/types/api';
import type { TagType } from '@/core/types/api/tags';

export const useAniDBTagsQuery = (params: TagsRequestType) =>
  useQuery<ListResultType<TagType>, unknown, TagType[]>({
    queryKey: ['anidb-tags', params],
    queryFn: () => axios.get('Tag/AniDB', { params }),
    select: transformListResultSimplified,
  });
