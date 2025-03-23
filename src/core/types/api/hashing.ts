import type { ConfigurationInfoType } from '@/core/types/api/configuration';
import type { PluginInfoType } from '@/core/types/api/plugin';

export type HashProviderInfoType = {
  ID: string;
  Version: string;
  Name: string;
  Description: string | null;
  Priority: number;
  AvailableHashTypes: string[];
  DefaultEnabledHashTypes: string[];
  EnabledHashTypes: string[];
  Configuration: ConfigurationInfoType | null;
  Plugin: PluginInfoType;
};
