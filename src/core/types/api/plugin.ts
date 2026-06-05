import type { ReleaseChannelType } from '@/core/types/api/init';

export type PackageThumbnailInfoType = {
  MimeType: string;
  Width: number;
  Height: number;
};

export type PluginInfoType = {
  ID: string;
  Name: string;
  Description: string;
  Version: string;
  RuntimeIdentifier: string;
  AbstractionVersion: string;
  SourceRevision?: string;
  ReleaseTag?: string;
  Channel: ReleaseChannelType;
  ReleasedAt: string;
  Authors?: string;
  RepositoryUrl?: string;
  HomepageUrl?: string;
  LoadOrder: number;
  Thumbnail?: PackageThumbnailInfoType;
  InstalledAt: string;
  IsInstalled: boolean;
  IsEnabled: boolean;
  IsPinned: boolean;
  IsActive: boolean;
  RestartPending: boolean;
  CanLoad: boolean;
  CanUninstall: boolean;
  CanEnableOrDisable: boolean;
  ContainingDirectory?: string;
  DLLs: string[];
};

export type PluginPageType = {
  ID: string;
  Name: string;
  Url: string;
  CanEmbed: boolean;
};

export type SharedPluginPageType = PluginPageType & {
  PluginInfo: PluginInfoType;
};
