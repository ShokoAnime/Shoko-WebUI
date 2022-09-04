import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';

import type { RootState } from '../store';
import type { EpisodeAniDBType } from '../types/api/episode';

export const episodeApi = createApi({
  reducerPath: 'episodeApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v3/Episode/',
    prepareHeaders: (headers, { getState }) => {
      const apikey = (getState() as RootState).apiSession.apikey;
      headers.set('apikey', apikey);
      return headers;
    },
  }),
  endpoints: build => ({
    // Get the Shoko.Server.API.v3.Models.Shoko.Episode.AniDB entry for the given episodeID.
    getEpisodeAnidb: build.query<EpisodeAniDBType, number>({
      query: episodeId => ({ url: `${episodeId}/AniDB` }),
    }),

  }),
});

export const { 
  useGetEpisodeAnidbQuery,
} = episodeApi;