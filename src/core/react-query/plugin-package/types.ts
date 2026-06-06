import type { PaginationType } from '@/core/types/api';

export type PluginPackageListFilters = PaginationType & {
  query?: string;
  onlyCompatible?: boolean;
  onlyLatest?: boolean;
  allowSync?: boolean;
  forceSyncNow?: boolean;
};

export type PluginPackageInstallRequestType = {
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

export type CheckForPluginUpdatesRequestType = {
  forceSync?: boolean;
  performUpgrade?: boolean;
};
