import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { RootState } from '../store';

export const splitV3Api = createApi({
  reducerPath: 'splitV3Api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v3/',
    prepareHeaders: (headers, { getState }) => {
      const apikey = (getState() as RootState).apiSession.apikey;
      headers.set('apikey', apikey);
      return headers;
    },
  }),
  tagTypes: ['EpisodeUpdated', 'FileDeleted', 'FileHashed', 'FileMatched', 'ImportFolder', 'SeriesEpisodes', 'SeriesUpdated', 'Settings'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({}),
});
