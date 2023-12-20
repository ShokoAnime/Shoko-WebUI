import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { invalidateQueries } from '@/core/react-query/queryClient';

import type { DeleteImportFolderRequestType } from '@/core/react-query/import-folder/types';
import type { ImportFolderType } from '@/core/types/api/import-folder';

export const useCreateImportFolderMutation = () =>
  useMutation({
    mutationFn: (folder: ImportFolderType) => axios.post('ImportFolder', folder),
    onSuccess: () => invalidateQueries(['import-folder']),
  });

export const useDeleteImportFolderMutation = () =>
  useMutation({
    mutationFn: ({ folderId, ...data }: DeleteImportFolderRequestType) =>
      axios.delete(`ImportFolder/${folderId}`, { data }),
    onSuccess: () => invalidateQueries(['import-folder']),
  });

export const useRescanImportFolderMutation = () =>
  useMutation({
    mutationFn: (folderId: number) => axios.get(`ImportFolder/${folderId}/Scan`),
  });

export const useUpdateImportFolderMutation = () =>
  useMutation({
    mutationFn: (folder: ImportFolderType) => axios.put('ImportFolder', folder),
    onSuccess: () => invalidateQueries(['import-folder']),
  });
