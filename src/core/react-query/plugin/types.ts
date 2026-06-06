import type { IncludeOnlyFilterType } from '@/core/react-query/types';

export type PluginListFilterType = {
  query?: string;
  active?: IncludeOnlyFilterType;
  installed?: IncludeOnlyFilterType;
  enabled?: IncludeOnlyFilterType;
  restartPending?: IncludeOnlyFilterType;
  allVersions?: boolean;
};

export type UpdatePluginRequestType = {
  pluginId: string;
  isEnabled?: boolean;
  pluginVersion?: string;
};

export type DeletePluginRequestType = {
  pluginId: string;
  purgeConfiguration?: boolean;
  pluginVersion?: string;
};
