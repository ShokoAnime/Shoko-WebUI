import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { mapPluginPackageManifests } from '@/core/react-query/plugin-package/helpers';

import type { PluginPackageCatalogEntryType, PluginPackageListFilters } from '@/core/react-query/plugin-package/types';
import type { ListResultType } from '@/core/types/api';
import type { PluginInfoType } from '@/core/types/api/plugin';
import type {
  PackageInfoType,
  PackageManifestInfoType,
  PackageRepositoryInfoType,
} from '@/core/types/api/plugin-package';

type PluginPackageQueryOptions<TQueryData, TData> = {
  enabled?: boolean;
  select?: (data: TQueryData) => TData;
};

export const selectPluginPackageCatalogEntries = (
  data: ListResultType<PackageManifestInfoType>,
): PluginPackageCatalogEntryType[] => mapPluginPackageManifests(data.List);

export const usePluginPackageRepositoriesQuery = (enabled = true) =>
  useQuery<PackageRepositoryInfoType[]>({
    queryKey: ['plugin-package', 'repositories'],
    queryFn: () => axios.get('Plugin/Package/Repository'),
    enabled,
  });

export const usePluginPackagesQuery = <TData = ListResultType<PackageInfoType>>(
  filters: PluginPackageListFilters,
  { enabled = true, select }: PluginPackageQueryOptions<ListResultType<PackageInfoType>, TData> = {},
) =>
  useQuery<ListResultType<PackageInfoType>, Error, TData>({
    queryKey: ['plugin-package', 'list', filters],
    queryFn: () => axios.get('Plugin/Package', { params: filters }),
    enabled,
    select,
  });

export const usePluginPackageManifestsQuery = <TData = ListResultType<PackageManifestInfoType>>(
  filters: Omit<PluginPackageListFilters, 'onlyCompatible' | 'onlyLatest'>,
  { enabled = true, select }: PluginPackageQueryOptions<ListResultType<PackageManifestInfoType>, TData> = {},
) =>
  useQuery<ListResultType<PackageManifestInfoType>, Error, TData>({
    queryKey: ['plugin-package', 'manifests', filters],
    queryFn: () => axios.get('Plugin/Package/Manifest', { params: filters }),
    enabled,
    select,
  });

export const usePluginPackageCatalogQuery = (
  filters: Omit<PluginPackageListFilters, 'onlyCompatible' | 'onlyLatest'>,
  installedPlugins?: PluginInfoType[],
  enabled = true,
) =>
  usePluginPackageManifestsQuery<PluginPackageCatalogEntryType[]>(filters, {
    enabled,
    select: data => mapPluginPackageManifests(data.List, installedPlugins),
  });
