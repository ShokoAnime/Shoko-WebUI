import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';

import type { PluginPackageListFilters } from '@/core/react-query/plugin-package/types';
import type { ListResultType } from '@/core/types/api';
import type {
  PackageManifestInfoType,
  PackageRepositoryInfoType,
  PluginPackageUpdateInfoType,
} from '@/core/types/api/plugin-package';

export const usePluginPackageRepositoriesQuery = () =>
  useQuery<PackageRepositoryInfoType[]>({
    queryKey: ['plugin-package', 'repositories'],
    queryFn: () => axios.get('Plugin/Package/Repository'),
  });

export const usePluginPackageManifestsQuery = (filters: PluginPackageListFilters, enabled = true) =>
  useQuery<ListResultType<PackageManifestInfoType>>({
    queryKey: ['plugin-package', 'manifests', filters],
    queryFn: () => axios.get('Plugin/Package/Manifest', { params: filters }),
    enabled,
  });

export const usePluginPackageUpdatesQuery = () =>
  useQuery<ListResultType<PluginPackageUpdateInfoType>>({
    queryKey: ['plugin-package', 'updates'],
    queryFn: () => axios.get('Plugin/Package/Updates', { params: { pageSize: 0 } }),
  });
