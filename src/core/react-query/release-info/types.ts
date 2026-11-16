import type { PluginInfoType } from '@/core/types/api/plugin';
import type { ProviderAvailabilityType } from '@/core/types/api/provider-availability';

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
  Availability: ProviderAvailabilityType;
  Configuration?: object;
  Plugin: PluginInfoType;
};
