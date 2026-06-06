import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { invalidateQueries } from '@/core/react-query/queryClient';

import type {
  AddPackageRepositoryRequestType,
  CheckForPluginUpdatesRequestType,
  PluginPackageInstallRequestType,
} from '@/core/react-query/plugin-package/types';

export const invalidatePluginAndPackageQueries = () => {
  invalidateQueries(['plugin']);
  invalidateQueries(['plugin-package']);
};

export const useAddPluginPackageRepositoryMutation = () =>
  useMutation({
    mutationFn: (body: AddPackageRepositoryRequestType) => axios.post('Plugin/Package/Repository', body),
    onSuccess: () => invalidateQueries(['plugin-package']),
  });

export const useDeletePluginPackageRepositoryMutation = () =>
  useMutation({
    mutationFn: (repositoryId: string) => axios.delete(`Plugin/Package/Repository/${repositoryId}`),
    onSuccess: () => invalidateQueries(['plugin-package']),
  });

export const useSyncPluginPackageRepositoryMutation = () =>
  useMutation({
    mutationFn: (repositoryId: string) =>
      axios.post(`Plugin/Package/Repository/${repositoryId}/Sync`, undefined, { params: { forceSync: true } }),
    onSuccess: () => invalidateQueries(['plugin-package']),
  });

export const useSyncAllPluginPackageRepositoriesMutation = () =>
  useMutation({
    mutationFn: () => axios.post('Plugin/Package/Repository/Sync', undefined, { params: { forceSync: true } }),
    onSuccess: () => invalidateQueries(['plugin-package']),
  });

export const useInstallPluginPackageMutation = () =>
  useMutation({
    mutationFn: ({ packageId, ...params }: PluginPackageInstallRequestType) =>
      axios.post(`Plugin/Package/${packageId}/Install`, undefined, { params }),
    onSuccess: invalidatePluginAndPackageQueries,
  });

export const useCheckPluginPackageUpdatesMutation = () =>
  useMutation({
    mutationFn: (body: CheckForPluginUpdatesRequestType = {}) => axios.post('Plugin/Package/CheckForUpdates', body),
    onSuccess: invalidatePluginAndPackageQueries,
  });
