import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';

import type { PluginPackageListFilters } from '@/core/react-query/plugin-package/types';
import type { ListResultType } from '@/core/types/api';
import type {
  PackageInfoType,
  PackageManifestInfoType,
  PackageRepositoryInfoType,
} from '@/core/types/api/plugin-package';

export const usePluginPackageRepositoriesQuery = () =>
  useQuery<PackageRepositoryInfoType[]>({
    queryKey: ['plugin-package', 'repositories'],
    queryFn: () => axios.get('Plugin/Package/Repository'),
  });

export const usePluginPackagesQuery = (filters: PluginPackageListFilters) =>
  useQuery<ListResultType<PackageInfoType>>({
    queryKey: ['plugin-package', 'list', filters],
    queryFn: () => axios.get('Plugin/Package', { params: filters }),
  });

export const usePluginPackageVersionsQuery = (packageId?: string) =>
  useQuery<PackageInfoType[]>({
    queryKey: ['plugin-package', 'versions', packageId],
    queryFn: () => axios.get(`Plugin/Package/${packageId}`),
    enabled: !!packageId,
  });

export const usePluginPackageManifestQuery = (packageId?: string) =>
  useQuery<PackageManifestInfoType>({
    queryKey: ['plugin-package', packageId, 'manifest'],
    queryFn: () => axios.get(`Plugin/Package/${packageId}/Manifest`),
    enabled: !!packageId,
  });
