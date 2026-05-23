import type { PluginInfoType } from '@/core/types/api/plugin';

export type PluginListFilters = {
  query?: string;
  active?: 'True' | 'False' | 'All';
  installed?: 'True' | 'False' | 'All';
  enabled?: 'True' | 'False' | 'All';
  restartPending?: 'True' | 'False' | 'All';
  allVersions?: boolean;
};

export type UpdatePluginMutationArgs = {
  pluginId: string;
  isEnabled: boolean;
  pluginVersion?: string;
};

export type DeletePluginMutationArgs = {
  pluginId: string;
  purgeConfiguration?: boolean;
  pluginVersion?: string;
};

export type PluginGroupsType = Record<string, PluginInfoType[]>;
