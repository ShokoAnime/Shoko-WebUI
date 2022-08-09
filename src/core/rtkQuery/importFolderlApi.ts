import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { RootState } from '../store';
import { ImportFolderType } from '../types/api/import-folder';

export const importFolderlApi = createApi({
  reducerPath: 'importFolderApi',
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
    }),
    updateImportFolder: build.mutation<ImportFolderType, ImportFolderType>({
      query: folder => ({
        url: '',
        method: 'PUT',
        body: folder,
      }),
    }),
  }),
});

export const {
  useGetImportFoldersQuery,
  useUpdateImportFolderMutation,
} = importFolderlApi;