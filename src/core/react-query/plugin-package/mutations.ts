import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { invalidateQueries } from '@/core/react-query/queryClient';

import type {
  AddPackageRepositoryRequestType,
  CheckForUpdatesRequestType,
  PackageInstallRequestType,
} from '@/core/react-query/plugin-package/types';

export const useAddPluginPackageRepositoryMutation = () =>
  useMutation({
    mutationFn: (body: AddPackageRepositoryRequestType) => axios.post('Plugin/Package/Repository', body),
    onSuccess: () => {
      invalidateQueries(['plugin-package', 'repositories']);
      invalidateQueries(['plugin-package', 'list']);
    },
  });

export const useDeletePluginPackageRepositoryMutation = () =>
  useMutation({
    mutationFn: (repositoryId: string) => axios.delete(`Plugin/Package/Repository/${repositoryId}`),
    onSuccess: () => {
      invalidateQueries(['plugin-package', 'repositories']);
      invalidateQueries(['plugin-package', 'list']);
    },
  });

export const useSyncPluginPackageRepositoryMutation = () =>
  useMutation({
    mutationFn: (repositoryId: string) =>
      axios.post(`Plugin/Package/Repository/${repositoryId}/Sync`, undefined, { params: { forceSync: true } }),
    onSuccess: () => {
      invalidateQueries(['plugin-package', 'repositories']);
      invalidateQueries(['plugin-package', 'list']);
    },
  });

export const useSyncAllPluginPackageRepositoriesMutation = () =>
  useMutation({
    mutationFn: ({ forceSync = true }: { forceSync?: boolean } = {}) =>
      axios.post('Plugin/Package/Repository/Sync', undefined, { params: { forceSync } }),
    onSuccess: () => {
      invalidateQueries(['plugin-package', 'repositories']);
      invalidateQueries(['plugin-package', 'list']);
    },
  });

export const useInstallPluginPackageMutation = () =>
  useMutation({
    mutationFn: ({ abstractionVersion, packageId, releaseVersion, runtimeIdentifier }: PackageInstallRequestType) =>
      axios.post(`Plugin/Package/${packageId}/Install`, undefined, {
        params: {
          abstractionVersion,
          releaseVersion,
          runtimeIdentifier,
        },
      }),
    onSuccess: () => {
      invalidateQueries(['plugin-package', 'list']);
      invalidateQueries(['plugin']);
    },
  });

export const useCheckPluginPackageUpdatesMutation = () =>
  useMutation({
    mutationFn: (body: CheckForUpdatesRequestType = {}) => axios.post('Plugin/Package/CheckForUpdates', body),
    onSuccess: () => {
      invalidateQueries(['plugin-package', 'list']);
      invalidateQueries(['plugin']);
    },
  });
