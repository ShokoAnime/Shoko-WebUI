import type { SuspensionDetailsType } from '@/core/types/api/metadata';
import type { PluginInfoType } from '@/core/types/api/plugin';

/** Whether a provider can be used, whether or not it is enabled, in the order the kinds win. */
export type ProviderAvailabilityKindType =
  | 'Available'
  | 'NotConfigured'
  | 'Suspended'
  | 'ManualOnly';

/** A suspension provider holding a provider back. */
export type SuspensionProviderStatusType = {
  ID: string;
  Plugin: PluginInfoType;
  Name: string;
  Description: string | null;
  IsSuspended: boolean;
  ResumesAt: string | null;
  RetryAfterSeconds: number | null;
  Suspensions: SuspensionDetailsType[];
};

/** Whether a release or relocation provider can be used, and why not. */
export type ProviderAvailabilityType = {
  Kind: ProviderAvailabilityKindType;
  /** Why the provider cannot be used; `null` while available. */
  Reason: string | null;
  /** When a suspension ends, only while suspended. */
  ResumesAt: string | null;
  /** The suspension providers holding the provider back; empty unless suspended. */
  SuspendedBy: SuspensionProviderStatusType[];
};
