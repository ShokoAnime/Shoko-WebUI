import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { groupPluginPackages } from '@/core/react-query/plugin-package/helpers';

import type { PluginPackageCatalogEntryType, PluginPackageListFilters } from '@/core/react-query/plugin-package/types';
import type { ListResultType } from '@/core/types/api';
import type { PackageInfoType, PackageRepositoryInfoType } from '@/core/types/api/plugin-package';

type PluginPackagesQueryOptions<TData> = {
  enabled?: boolean;
  select?: (data: ListResultType<PackageInfoType>) => TData;
};

export const selectGroupedPluginPackages = (data: ListResultType<PackageInfoType>): PluginPackageCatalogEntryType[] =>
  groupPluginPackages(data.List);

export const usePluginPackageRepositoriesQuery = (enabled = true) =>
  useQuery<PackageRepositoryInfoType[]>({
    queryKey: ['plugin-package', 'repositories'],
    queryFn: () => axios.get('Plugin/Package/Repository'),
    enabled,
  });

export const usePluginPackagesQuery = <TData = ListResultType<PackageInfoType>>(
  filters: PluginPackageListFilters,
  { enabled = true, select }: PluginPackagesQueryOptions<TData> = {},
) =>
  useQuery<ListResultType<PackageInfoType>, Error, TData>({
    queryKey: ['plugin-package', 'list', filters],
    queryFn: () => axios.get('Plugin/Package', { params: filters }),
    enabled,
    select,
  });
