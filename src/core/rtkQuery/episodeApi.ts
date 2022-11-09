import { splitV3Api } from './splitV3Api';

import type { EpisodeAniDBType } from '../types/api/episode';

const episodeApi = splitV3Api.injectEndpoints({
  endpoints: build => ({
    // Get the Shoko.Server.API.v3.Models.Shoko.Episode.AniDB entry for the given episodeID.
    getEpisodeAnidb: build.query<EpisodeAniDBType, number>({
      query: episodeId => ({ url: `Episode/${episodeId}/AniDB` }),
    }),
  }),
});

export const {
  useGetEpisodeAnidbQuery,
} = episodeApi;
