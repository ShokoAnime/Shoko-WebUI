import type { PluginInfoType } from '@/core/types/api/plugin';

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
  Configuration?: object;
  Plugin: PluginInfoType;
};
