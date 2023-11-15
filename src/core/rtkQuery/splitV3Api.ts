import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { RootState } from '@/core/store';

export const splitV3Api = createApi({
  reducerPath: 'splitV3Api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v3/',
    prepareHeaders: (headers, { getState }) => {
      const { apikey } = (getState() as RootState).apiSession;
      headers.set('apikey', apikey);
      return headers;
    },
  }),
  tagTypes: [
    'AVDumpEvent',
    'EpisodeUpdated',
    'FileDeleted',
    'FileHashed',
    'FileIgnored',
    'FileMatched',
    'ImportFolder',
    'QueueItems',
    'SeriesAniDB',
    'SeriesEpisodes',
    'SeriesUpdated',
    'Settings',
    'Users',
    'SeriesSearch',
    'UtilitiesRefresh',
    'WebUIUpdateCheck',
  ],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({}),
});
