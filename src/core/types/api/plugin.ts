export type PackageThumbnailInfoType = {
  MimeType: string;
  Width: number;
  Height: number;
};

export type PluginInfoType = {
  ID: string;
  Name: string;
  Description: string | null;
  Version: string;
  RuntimeIdentifier: string;
  AbstractionVersion: string;
  SourceRevision?: string | null;
  ReleaseTag?: string | null;
  Channel: string;
  ReleasedAt: string;
  Authors?: string | null;
  LoadOrder: number;
  Thumbnail?: PackageThumbnailInfoType | null;
  InstalledAt: string;
  IsInstalled: boolean;
  IsEnabled: boolean;
  IsActive: boolean;
  RestartPending: boolean;
  CanLoad: boolean;
  CanUninstall: boolean;
  CanEnableOrDisable: boolean;
  IsPinned: boolean;
  RepositoryUrl?: string | null;
  HomepageUrl?: string | null;
  ContainingDirectory?: string | null;
  DLLs: string[];
};

export type UpdatePluginInfoBodyType = {
  isEnabled?: boolean;
};
