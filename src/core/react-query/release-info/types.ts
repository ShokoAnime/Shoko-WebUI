import type { PluginInfoType } from '@/core/types/api/plugin';

export type ReleaseInfoSummaryType = {
  ParallelMode: boolean;
};

export type UpdateReleaseInfoSettingsType = {
  ParallelMode?: boolean;
};

export type UpdateManyReleaseInfoProviderType = UpdateOneReleaseInfoProviderType & {
  ID: string;
};

export type UpdateOneReleaseInfoProviderType = {
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
