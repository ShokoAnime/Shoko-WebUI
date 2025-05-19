import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { invalidateQueries } from '@/core/react-query/queryClient';

import type { DeleteManagedFolderRequestType } from '@/core/react-query/managed-folder/types';
import type { ManagedFolderType } from '@/core/types/api/managed-folder';

export const useCreateManagedFolderMutation = () =>
  useMutation({
    mutationFn: (folder: ManagedFolderType) => axios.post('ManagedFolder', folder),
    onSuccess: () => invalidateQueries(['managed-folder']),
  });

export const useDeleteManagedFolderMutation = () =>
  useMutation({
    mutationFn: ({ folderId, ...data }: DeleteManagedFolderRequestType) =>
      axios.delete(`ManagedFolder/${folderId}`, { data }),
    onSuccess: () => invalidateQueries(['managed-folder']),
  });

export const useRescanManagedFolderMutation = () =>
  useMutation({
    mutationFn: (folderId: number) => axios.get(`ManagedFolder/${folderId}/Scan`),
  });

export const useUpdateManagedFolderMutation = () =>
  useMutation({
    mutationFn: (folder: ManagedFolderType) => axios.put('ManagedFolder', folder),
    onSuccess: () => invalidateQueries(['managed-folder']),
  });
