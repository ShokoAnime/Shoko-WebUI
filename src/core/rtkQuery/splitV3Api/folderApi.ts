import { splitV3Api } from '../splitV3Api';
import { DriveType, FolderType } from '../../types/api/folder';

let id = 0;
export const getNextId = () => ++id;

const folderApi = splitV3Api.injectEndpoints({
  endpoints: build => ({
    getFolderDrives: build.query<DriveType[], void>({
      query: () => ({ url: 'Folder/Drives' }),
      transformResponse: (response: DriveType[])  => response.map(item => ({ ...item, nodeId: getNextId() })),
    }),
    getFolder: build.query<FolderType[], string>({
      query: path => ({ url: 'Folder', params: { Path: path } }),
      transformResponse: (response: FolderType[])  => response.map(item => ({ ...item, nodeId: getNextId() })),
    }),
  }),
});

export const { useGetFolderDrivesQuery, useLazyGetFolderQuery } = folderApi;