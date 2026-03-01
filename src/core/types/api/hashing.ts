import type { PluginInfoType } from '@/core/types/api/plugin';

export type HashProviderInfoType = {
  ID: string;
  Version: string;
  Name: string;
  Description: string | null;
  AvailableHashTypes: string[];
  EnabledHashTypes: string[];
  Configuration: object | null;
  Plugin: PluginInfoType;
};
