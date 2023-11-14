import { splitV3Api } from '@/core/rtkQuery/splitV3Api';

import type { DataSourceType } from '@/core/types/api/common';
import type { EpisodeAniDBType, EpisodeTvDBType, EpisodeType } from '@/core/types/api/episode';
import type { FileType } from '@/core/types/api/file';

type EpisodeFilesQuery = {
  episodeId: string;
  includeDataFrom?: DataSourceType[];
  includeXRefs?: boolean;
  isManuallyLinked?: boolean;
  includeMediaInfo?: boolean;
};

type EpisodeQuery = {
  episodeId: string;
  includeDataFrom?: DataSourceType[];
};

const episodeApi = splitV3Api.injectEndpoints({
  endpoints: build => ({
    // Get the Shoko.Server.API.v3.Models.Shoko.Episode.AniDB entry for the given episodeID.
    getEpisodeAnidb: build.query<EpisodeAniDBType, number>({
      query: episodeId => ({ url: `Episode/${episodeId}/AniDB` }),
    }),
    // Get the Shoko.Server.API.v3.Models.Shoko.Episode.AniDB entry for the given episodeID.
    getEpisode: build.query<EpisodeType, EpisodeQuery>({
      query: ({ episodeId, ...params }) => ({ url: `Episode/${episodeId}`, params }),
    }),
    // Get the Shoko.Server.API.v3.Models.Shoko.Episode.AniDB entry for the given episodeID.
    getEpisodeTvdb: build.query<EpisodeTvDBType[], number>({
      query: episodeId => ({ url: `Episode/${episodeId}/TvDB` }),
    }),
    // Get the Shoko.Server.API.v3.Models.Shoko.Files for the Shoko.Server.API.v3.Models.Shoko.Episode with the given episodeID.
    getEpisodeFiles: build.query<FileType[], EpisodeFilesQuery>({
      query: ({ episodeId, ...params }) => ({ url: `Episode/${episodeId}/File?includeAbsolutePaths=true`, params }),
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
  useGetEpisodeAnidbQuery,
  useGetEpisodeQuery,
  useGetEpisodeTvdbQuery,
  useLazyGetEpisodeFilesQuery,
  usePostEpisodeHiddenMutation,
  usePostEpisodeWatchedMutation,
} = episodeApi;
