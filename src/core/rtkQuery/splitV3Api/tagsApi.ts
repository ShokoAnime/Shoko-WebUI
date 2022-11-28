import { splitV3Api } from '../splitV3Api';

import type { ListResultType, PaginationType } from '../../types/api';
import type { TagType } from '../../types/api/tags';

const tagsApi = splitV3Api.injectEndpoints({
  endpoints: build => ({
    // Get a list of all known anidb tags, optionally with a filter applied.
    getAniDBTags: build.query<Array<TagType>, PaginationType & { excludeDescriptions?: boolean }>({
      query: params => ({ url: 'Tag/AniDB', params }),
      transformResponse: (response: ListResultType<Array<TagType>>) => response.List,
    }),
  }),
});

export const {
  useGetAniDBTagsQuery,
} = tagsApi;
