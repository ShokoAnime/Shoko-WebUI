import type { PluginInfoType } from '@/core/types/api/plugin';

export type PackageRepositoryInfoType = {
  ID: string;
  Name: string;
  Url: string;
  LastFetchedAt?: string | null;
  StaleTime?: string | null;
};

export type PackageArchiveInfoType = {
  RuntimeIdentifier: string;
  AbstractionVersion: string;
  ArchiveUrl: string;
  ArchiveChecksum: string;
  IsCompatible: boolean;
};

export type PluginPackageArchiveType = {
  RuntimeIdentifier: string;
  AbstractionVersion: string;
  ArchiveUrl: string;
  ArchiveChecksum: string;
  IsCompatible: boolean;
};

export type PackageReleaseInfoType = {
  RepositoryID: string;
  Version: string;
  Tag?: string | null;
  SourceRevision?: string | null;
  ReleasedAt: string;
  Channel: string;
  ReleaseNotes?: string | null;
  Archives: PackageArchiveInfoType[];
};

export type PackageManifestInfoType = {
  PackageID: string;
  Name: string;
  Overview: string;
  Authors: string;
  Tags: string[];
  Thumbnail?: {
    MimeType: string;
    Width: number;
    Height: number;
  } | null;
  Releases: PackageReleaseInfoType[];
  LastFetchedAt: string;
};

export type PackageInfoType = {
  Repository?: PackageRepositoryInfoType | null;
  Manifest: PackageManifestInfoType;
  Release: PackageReleaseInfoType;
  Archive: PackageArchiveInfoType;
  Plugin?: PluginInfoType | null;
};

export type AddPackageRepositoryBodyType = {
  name: string;
  url: string;
  staleTime?: string;
};

export type CheckForUpdatesBodyType = {
  forceSync?: boolean;
  performUpgrade?: boolean;
};
