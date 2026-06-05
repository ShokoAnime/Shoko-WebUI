import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { invalidateQueries } from '@/core/react-query/queryClient';

import type {
  AddPackageRepositoryRequestType,
  CheckForUpdatesRequestType,
  PackageInstallRequestType,
} from '@/core/react-query/plugin-package/types';

const invalidateRepositoryQueries = () => {
  invalidateQueries(['plugin-package', 'repositories']);
  invalidateQueries(['plugin-package', 'list']);
};

export const invalidatePluginAndPackageQueries = () => {
  invalidateQueries(['plugin']);
  invalidateQueries(['plugin-package', 'list']);
};

export const useAddPluginPackageRepositoryMutation = () =>
  useMutation({
    mutationFn: (body: AddPackageRepositoryRequestType) => axios.post('Plugin/Package/Repository', body),
    onSuccess: invalidateRepositoryQueries,
  });

export const useDeletePluginPackageRepositoryMutation = () =>
  useMutation({
    mutationFn: (repositoryId: string) => axios.delete(`Plugin/Package/Repository/${repositoryId}`),
    onSuccess: invalidateRepositoryQueries,
  });

export const useSyncPluginPackageRepositoryMutation = () =>
  useMutation({
    mutationFn: (repositoryId: string) =>
      axios.post(`Plugin/Package/Repository/${repositoryId}/Sync`, undefined, { params: { forceSync: true } }),
    onSuccess: invalidateRepositoryQueries,
  });

export const useSyncAllPluginPackageRepositoriesMutation = () =>
  useMutation({
    mutationFn: () => axios.post('Plugin/Package/Repository/Sync', undefined, { params: { forceSync: true } }),
    onSuccess: invalidateRepositoryQueries,
  });

export const useInstallPluginPackageMutation = () =>
  useMutation({
    mutationFn: ({ packageId, ...params }: PackageInstallRequestType) =>
      axios.post(`Plugin/Package/${packageId}/Install`, undefined, { params }),
    onSuccess: invalidatePluginAndPackageQueries,
  });

export const useCheckPluginPackageUpdatesMutation = () =>
  useMutation({
    mutationFn: (body: CheckForUpdatesRequestType = {}) => axios.post('Plugin/Package/CheckForUpdates', body),
    onSuccess: invalidatePluginAndPackageQueries,
  });
