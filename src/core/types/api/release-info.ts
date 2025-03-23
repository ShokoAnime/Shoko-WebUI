import type { ConfigurationInfoType } from '@/core/types/api/configuration';
import type { PluginInfoType } from '@/core/types/api/plugin';

export type ReleaseProviderInfoType = {
  ID: string;
  Version: string;
  Name: string;
  Description: string | null;
  Priority: number;
  IsEnabled: boolean;
  Configuration: ConfigurationInfoType | null;
  Plugin: PluginInfoType;
};
