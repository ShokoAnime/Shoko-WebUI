import type { AVDumpResultType, FileLinkApiType, FileRequestType, FileType } from '@/core/types/api/file';
import type { ListResultType } from '@/core/types/api';
import { splitV3Api } from '../splitV3Api';

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
    deleteFileLink: build.mutation<void, string>({
      query: fileId => ({
        url: `File/${fileId}/Link`,
        method: 'DELETE',
        headers: {
          'content-type': 'application/json',
        },
      }),
    }),

    // Get or search through the files accessible to the current user.
    getFiles: build.query<ListResultType<FileType[]>, FileRequestType>({
      query: params => ({
        url: 'File',
        params,
      }),
      providesTags: ['FileDeleted', 'FileHashed', 'FileIgnored', 'FileMatched'],
    }),
  }),
});

export const {
  useDeleteFileMutation,
  usePutFileIgnoreMutation,
  useLazyPostFileAVDumpQuery,
  usePostFileRescanMutation,
  usePostFileRehashMutation,
  usePostFileLinkMutation,
  useDeleteFileLinkMutation,
  useGetFilesQuery,
} = fileApi;
