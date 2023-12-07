import { splitV3Api } from '@/core/rtkQuery/splitV3Api';

import type { DataSourceType } from '@/core/types/api/common';
import type { FileType } from '@/core/types/api/file';

type EpisodeFilesQuery = {
  episodeId: string;
  includeDataFrom?: DataSourceType[];
  includeXRefs?: boolean;
  isManuallyLinked?: boolean;
  includeMediaInfo?: boolean;
};

const episodeApi = splitV3Api.injectEndpoints({
  endpoints: build => ({
    // Get the Shoko.Server.API.v3.Models.Shoko.Files for the Shoko.Server.API.v3.Models.Shoko.Episode with the given episodeID.
    getEpisodeFiles: build.query<FileType[], EpisodeFilesQuery>({
      query: ({ episodeId, ...params }) => ({ url: `Episode/${episodeId}/File?includeAbsolutePaths=true`, params }),
      providesTags: ['FileDeleted', 'FileMatched'],
    }),
    // Set the watched status on an episode
    postEpisodeWatched: build.mutation<void, { episodeId: string, watched: boolean }>({
      query: ({ episodeId, watched }) => ({
        url: `Episode/${episodeId}/Watched/${watched}`,
        method: 'POST',
      }),
      invalidatesTags: ['SeriesEpisodes'],
    }),
    // Set or unset the episode hidden status by the given episodeID.
    postEpisodeHidden: build.mutation<void, { episodeId: string, hidden: boolean }>({
      query: ({ episodeId, hidden }) => ({
        url: `Episode/${episodeId}/SetHidden`,
        method: 'POST',
        params: {
          value: hidden,
          updateStats: true,
        },
      }),
      invalidatesTags: ['SeriesEpisodes', 'SeriesAniDB'],
    }),
  }),
});

export const {
  useLazyGetEpisodeFilesQuery,
  usePostEpisodeHiddenMutation,
  usePostEpisodeWatchedMutation,
} = episodeApi;
