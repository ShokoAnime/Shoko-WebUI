import type { PaginationType } from '@/core/types/api';
import type { PluginInfoType } from '@/core/types/api/plugin';
import type {
  PackageArchiveInfoType,
  PackageInfoType,
  PackageManifestInfoType,
  PackageReleaseInfoType,
} from '@/core/types/api/plugin-package';

export type PluginPackageListFilters = PaginationType & {
  query?: string;
  onlyCompatible?: boolean;
  onlyLatest?: boolean;
  allowSync?: boolean;
  forceSyncNow?: boolean;
};

export type PluginPackageCatalogArchiveType = PackageArchiveInfoType & {
  IsCompatible: boolean;
  IsInstalled: boolean;
};

export type PluginPackageCatalogReleaseType = Omit<PackageReleaseInfoType, 'Archives'> & {
  Archives: PluginPackageCatalogArchiveType[];
  IsInstalled: boolean;
  IsLatest: boolean;
  IsUpdateAvailable: boolean;
};

export type PluginPackageCatalogEntryType = {
  PackageID: string;
  Name: string;
  Overview: string;
  Authors: string;
  Tags: string[];
  Thumbnail?: PackageManifestInfoType['Thumbnail'];
  LastFetchedAt: string;
  Plugin?: PluginInfoType | null;
  Releases: PluginPackageCatalogReleaseType[];
  HasCompatibleInstallOption: boolean;
  HasInstalledVersion: boolean;
  HasUpdateAvailable: boolean;
};

export type PackageInstallRequestType = {
  packageId: string;
  releaseVersion?: string;
  abstractionVersion?: string;
  runtimeIdentifier?: string;
};

export type AddPackageRepositoryRequestType = {
  name: string;
  url: string;
  staleTime?: string;
};

export type CheckForUpdatesRequestType = {
  forceSync?: boolean;
  performUpgrade?: boolean;
};

export type PackageManifestLookup = Record<string, PluginPackageCatalogEntryType>;

export type PluginUpdateSummaryType = {
  ID: string;
  PackageID: string;
  Name: string;
  CurrentVersion: string;
  LatestVersion: string;
  RuntimeIdentifier: string;
};

export type PackageVersionsLookupType = Record<string, PackageInfoType[]>;
