import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { RootState } from '../store';
import type { FileType } from '../types/api/file';
import type { ListResultType, PaginationType } from '../types/api';

export const fileApi = createApi({
  reducerPath: 'file',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v3/File/',
    prepareHeaders: (headers, { getState }) => {
      const apikey = (getState() as RootState).apiSession.apikey;
      headers.set('apikey', apikey);
      return headers;
    },
  }),
  endpoints: build => ({

    // Get ignored files.
    getFileIgnored: build.query<ListResultType<Array<FileType>>, PaginationType>({
      query: params => ({ url: 'Ignored', params }),
    }),

    // Get unrecognized files. Shoko.Server.API.v3.Models.Shoko.File.FileDetailed is not relevant here, as there will be no links. Use pageSize and page (index 0) in the query to enable pagination.
    getFileUnrecognized: build.query<ListResultType<Array<FileType>>, PaginationType>({
      query: params => ({ url: 'Unrecognized', params }),
    }),

    // Mark or unmark a file as ignored.
    putFileIgnore: build.query<void, { fileID: number, value: boolean }>({
      query: params => ({
        url: `${params.fileID}/Ignore`,
        params,
        method: 'PUT',
      }),
    }),
  }),
});

export const {
  useGetFileIgnoredQuery,
  useGetFileUnrecognizedQuery,
  useLazyPutFileIgnoreQuery,
} = fileApi;
