import type { PluginInfoType } from '@/core/types/api/plugin';

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
};

export type PackageReleaseInfoType = {
  RepositoryID: string;
  Version: string;
  Tag?: string;
  SourceRevision?: string;
  ReleasedAt: string;
  Channel: string;
  ReleaseNotes?: string;
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
  };
  Releases: PackageReleaseInfoType[];
  LastFetchedAt: string;
};

export type PackageInfoType = {
  Repository?: PackageRepositoryInfoType;
  Manifest: PackageManifestInfoType;
  Release: PackageReleaseInfoType;
  Archive: PackageArchiveInfoType;
  Plugin?: PluginInfoType;
};
