import type { PluginInfoType } from '@/core/types/api/plugin';

export type HashingSummaryType = {
  ParallelMode: boolean;
};

export type UpdateHashingSettingsType = {
  ParallelMode?: boolean;
};

export type UpdateManyHashingProviderInfoType = UpdateOneHashingProviderInfoType & {
  ID: string;
};

export type UpdateOneHashingProviderInfoType = {
  EnabledHashTypes?: string[];
};

export type HashProviderInfoType = {
  ID: string;
  Version: string;
  Name: string;
  Description?: string;
  AvailableHashTypes: string[];
  EnabledHashTypes: string[];
  Configuration?: object;
  Plugin: PluginInfoType;
};
