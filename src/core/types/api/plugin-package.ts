import type { ReleaseChannelType } from '@/core/types/api/init';
import type { PackageThumbnailInfoType, PluginInfoType } from '@/core/types/api/plugin';

export type PackageRepositoryInfoType = {
  ID: string;
  Name: string;
  Url: string;
  LastFetchedAt?: string;
  StaleTime?: string;
};

export type PackageArchiveInfoType = {
  RuntimeIdentifier: string;
  AbstractionVersion: string;
  ArchiveUrl: string;
  ArchiveChecksum: string;
  IsCompatible: boolean;
  IsInstalled: boolean;
};

export type PackageReleaseInfoType = {
  RepositoryID: string;
  Version: string;
  Tag?: string;
  SourceRevision?: string;
  ReleasedAt: string;
  Channel: ReleaseChannelType;
  ReleaseNotes?: string;
  IsInstalled: boolean;
  Archives?: PackageArchiveInfoType[];
};

export type PackageManifestInfoType = {
  PackageID: string;
  Name: string;
  Overview: string;
  Authors: string;
  Tags: string[];
  Thumbnail?: PackageThumbnailInfoType;
  Releases?: PackageReleaseInfoType[];
  LastFetchedAt: string;
};

export type PackageInfoType = {
  Repository?: PackageRepositoryInfoType;
  Manifest: PackageManifestInfoType;
  Release: PackageReleaseInfoType;
  Archive: PackageArchiveInfoType;
  Plugin?: PluginInfoType;
};

export type PluginPackageUpdateInfoType = {
  PackageID: string;
  Name: string;
  Current: PackageInfoType;
  Latest: PackageInfoType;
};
