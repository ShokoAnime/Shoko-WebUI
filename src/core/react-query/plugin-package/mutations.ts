import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { invalidateQueries } from '@/core/react-query/queryClient';

import type { PackageInstallMutationArgs } from '@/core/react-query/plugin-package/types';
import type { AddPackageRepositoryBodyType, CheckForUpdatesBodyType } from '@/core/types/api/plugin-package';

export const useAddPluginPackageRepositoryMutation = () =>
  useMutation({
    mutationFn: (body: AddPackageRepositoryBodyType) => axios.post('Plugin/Package/Repository', body),
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
    mutationFn: ({ forceSync = true, repositoryId }: { repositoryId: string, forceSync?: boolean }) =>
      axios.post(`Plugin/Package/Repository/${repositoryId}/Sync`, undefined, { params: { forceSync } }),
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
    mutationFn: ({ abstractionVersion, packageId, releaseVersion, runtimeIdentifier }: PackageInstallMutationArgs) =>
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
    mutationFn: (body: CheckForUpdatesBodyType = {}) => axios.post('Plugin/Package/CheckForUpdates', body),
    onSuccess: () => {
      invalidateQueries(['plugin-package', 'list']);
      invalidateQueries(['plugin']);
    },
  });
