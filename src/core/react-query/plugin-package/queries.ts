import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';

import type { PluginPackageListFilters } from '@/core/react-query/plugin-package/types';
import type { ListResultType } from '@/core/types/api';
import type { PackageInfoType, PackageRepositoryInfoType } from '@/core/types/api/plugin-package';

export const usePluginPackageRepositoriesQuery = (enabled = true) =>
  useQuery<PackageRepositoryInfoType[]>({
    queryKey: ['plugin-package', 'repositories'],
    queryFn: () => axios.get('Plugin/Package/Repository'),
    enabled,
  });

export const usePluginPackagesQuery = (filters: PluginPackageListFilters, enabled = true) =>
  useQuery<ListResultType<PackageInfoType>>({
    queryKey: ['plugin-package', 'list', filters],
    queryFn: () => axios.get('Plugin/Package', { params: filters }),
    enabled,
  });
