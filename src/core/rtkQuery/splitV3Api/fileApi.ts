import { splitV3Api } from '../splitV3Api';

import type { FileType, FileLinkApiType, AVDumpResultType } from '../../types/api/file';
import type { ListResultType, PaginationType } from '../../types/api';

const fileApi = splitV3Api.injectEndpoints({
  endpoints: build => ({

    // Delete a file.
    deleteFile: build.mutation<void, { fileId: number, removeFolder: boolean }>({
      query: ({ fileId, ...params }) => ({
        url: `File/${fileId}`,
        params,
        method: 'DELETE',
      }),
    }),

    // Get ignored files.
    getFileIgnored: build.query<ListResultType<Array<FileType>>, PaginationType>({
      query: params => ({ url: 'File/Ignored', params }),
      providesTags: ['FileIgnored'],
    }),

    // Get unrecognized files. Shoko.Server.API.v3.Models.Shoko.File.FileDetailed is not relevant here, as there will be no links. Use pageSize and page (index 0) in the query to enable pagination.
    getFileUnrecognized: build.query<ListResultType<Array<FileType>>, PaginationType>({
      query: params => ({ url: 'File/Unrecognized', params }),
      providesTags: ['FileDeleted', 'FileHashed', 'FileIgnored', 'FileMatched'],
    }),

    // Mark or unmark a file as ignored.
    putFileIgnore: build.mutation<void, { fileId: number, value: boolean }>({
      query: ({ fileId, ...params }) => ({
        url: `File/${fileId}/Ignore`,
        params,
        method: 'PUT',
      }),
      invalidatesTags: ['FileIgnored'],
    }),

    // Run a file through AVDump and return the result.
    postFileAVDump: build.query<AVDumpResultType, number>({
      query: fileId => ({
        url: `File/${fileId}/AVDump`,
        method: 'POST',
      }),
    }),

    // Rescan a file on AniDB.
    postFileRescan: build.mutation<void, number>({
      query: fileId => ({
        url: `File/${fileId}/Rescan`,
        method: 'POST',
      }),
    }),

    // Rehash a file.
    postFileRehash: build.mutation<void, number>({
      query: fileId => ({
        url: `File/${fileId}/Rehash`,
        method: 'POST',
      }),
    }),

    // Link multiple files to a single episode.
    postFileLink: build.mutation<void, FileLinkApiType>({
      query: params => ({
        url: 'File/Link',
        method: 'POST',
        body: params,
      }),
    }),

    // Unlink all the episodes if no body is given, or only the specified episodes from the file.
    deleteFileLink: build.mutation<void, number>({
      query: fileId => ({
        url: `File/${fileId}/Link`,
        method: 'DELETE',
        headers: {
          'content-type': 'application/json',
        },
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
  useDeleteFileLinkMutation,
} = fileApi;
