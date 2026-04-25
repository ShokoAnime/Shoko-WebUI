import type { ConfigurationInfoType } from '@/core/types/api/configuration';
import type { PluginInfoType } from '@/core/types/api/plugin';

export type ReleaseInfoSettingsType = {
  ParallelMode?: boolean;
};

export type UpdateReleaseInfoProvidersType = {
  ID: string;
  Priority?: number;
  IsEnabled?: boolean;
};

export type ReleaseProviderInfoType = {
  ID: string;
  Version: string;
  Name: string;
  Description?: string;
  Priority: number;
  IsEnabled: boolean;
  Configuration?: ConfigurationInfoType;
  Plugin: PluginInfoType;
};
