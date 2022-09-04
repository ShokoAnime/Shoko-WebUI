import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { RootState } from '../store';
import type { FileType, FileLinkApiType, AVDumpResultType } from '../types/api/file';
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

    // Delete a file.
    deleteFile: build.mutation<void, { fileId: number, removeFolder: boolean }>({
      query: ({ fileId, ...params }) => ({
        url: `${fileId}`,
        params,
        method: 'DELETE',
      }),
    }),

    // Get ignored files.
    getFileIgnored: build.query<ListResultType<Array<FileType>>, PaginationType>({
      query: params => ({ url: 'Ignored', params }),
    }),

    // Get unrecognized files. Shoko.Server.API.v3.Models.Shoko.File.FileDetailed is not relevant here, as there will be no links. Use pageSize and page (index 0) in the query to enable pagination.
    getFileUnrecognized: build.query<ListResultType<Array<FileType>>, PaginationType>({
      query: params => ({ url: 'Unrecognized', params }),
    }),

    // Mark or unmark a file as ignored.
    putFileIgnore: build.mutation<void, { fileId: number, value: boolean }>({
      query: ({ fileId, ...params }) => ({
        url: `${fileId}/Ignore`,
        params,
        method: 'PUT',
      }),
    }),

    // Run a file through AVDump and return the result.
    postFileAVDump: build.query<AVDumpResultType, number>({
      query: fileId => ({
        url: `${fileId}/AVDump`,
        method: 'POST',
      }),
    }),

    // Rescan a file on AniDB.
    postFileRescan: build.mutation<void, number>({
      query: fileId => ({
        url: `${fileId}/Rescan`,
        method: 'POST',
      }),
    }),

    // Rehash a file.
    postFileRehash: build.mutation<void, number>({
      query: fileId => ({
        url: `${fileId}/Rehash`,
        method: 'POST',
      }),
    }),
    
    // Link multiple files to a single episode.
    postFileLink: build.mutation<void, FileLinkApiType>({
      query: params => ({
        url: 'Link',
        method: 'POST',
        body: params,
      }),
    }),
  }),
});

export const {
  useDeleteFileMutation,
  useGetFileIgnoredQuery,
  useGetFileUnrecognizedQuery,
  usePutFileIgnoreMutation,
  useLazyPostFileAVDumpQuery,
  usePostFileRescanMutation,
  usePostFileRehashMutation,
  usePostFileLinkMutation,
} = fileApi;
