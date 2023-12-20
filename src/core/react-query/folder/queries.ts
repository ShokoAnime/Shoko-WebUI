import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { transformNode } from '@/core/react-query/folder/helpers';

import type { DriveType, FolderType } from '@/core/types/api/folder';

export const useFolderQuery = (path: string, enabled = true) =>
  useQuery<FolderType[]>({
    queryKey: ['folder', 'path', path],
    queryFn: () => axios.get('Folder', { params: { Path: path } }),
    select: transformNode,
    enabled,
  });

export const useFolderDrivesQuery = (enabled = true) =>
  useQuery<DriveType[]>({
    queryKey: ['folder', 'drives'],
    queryFn: () => axios.get('Folder/Drives'),
    select: transformNode,
    enabled,
  });
