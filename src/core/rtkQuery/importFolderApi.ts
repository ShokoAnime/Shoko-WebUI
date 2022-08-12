import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { RootState } from '../store';
import { ImportFolderType } from '../types/api/import-folder';

export const importFolderApi = createApi({
  reducerPath: 'importFolderApi',
  tagTypes: ['ImportFolder'],
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v3/ImportFolder',
    prepareHeaders: (headers, { getState }) => {
      const apikey = (getState() as RootState).apiSession.apikey;
      headers.set('apikey', apikey);
      return headers;
    },
  }),
  endpoints: build => ({
    // Get import folders
    getImportFolders: build.query<Array<ImportFolderType>, void>({
      query: () => ({ url: '' }),
      providesTags: ['ImportFolder'],
    }),
    updateImportFolder: build.mutation<ImportFolderType, ImportFolderType>({
      query: folder => ({
        url: '',
        method: 'PUT',
        body: folder,
      }),
      invalidatesTags: ['ImportFolder'],
    }),
    createImportFolder: build.mutation<ImportFolderType, ImportFolderType>({
      query: folder => ({
        url: '',
        method: 'POST',
        body: folder,
      }),
      invalidatesTags: ['ImportFolder'],
    }),
    deleteImportFolder: build.mutation<boolean, { folderId: number; removeRecords?: boolean; updateMyList?: boolean; }>({
      query: ({ folderId, ...params }) => ({
        url: `/${folderId}`,
        method: 'DELETE',
        params,
      }),
      invalidatesTags: ['ImportFolder'],
    }),
    rescanImportFolder: build.query<void, number>({
      query: folderId => ({ url: `/${folderId}/Scan` }),
    }),
  }),
});

export const {
  useGetImportFoldersQuery,
  useUpdateImportFolderMutation,
  useCreateImportFolderMutation,
  useDeleteImportFolderMutation,
  useLazyRescanImportFolderQuery,
} = importFolderApi;