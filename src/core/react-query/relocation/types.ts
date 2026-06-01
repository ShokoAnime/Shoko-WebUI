import type { RelocationConfigurationType } from '@/core/types/api/relocation';

export type CreateRelocationPresetRequestType = {
  ProviderID: string;
  Name: string;
  IsDefault?: boolean;
  Configuration?: Record<string, unknown>;
};

export type UpdateRelocationPresetRequestType = {
  presetId: string;
  Name?: string;
  IsDefault?: boolean;
};

export type RelocationBaseRequestType = {
  move?: boolean;
  rename?: boolean;
  allowRelocationInsideDestination?: boolean;
  FileIDs: number[];
};

export type RelocationPreviewRequestType = RelocationBaseRequestType & {
  ProviderID: string;
  Configuration?: Record<string, unknown>;
};

export type RelocationRelocateRequestType = RelocationBaseRequestType & {
  presetId: string;
  deleteEmptyDirectories?: boolean;
};

export type UpdateRelocationConfigurationRequestType = RelocationConfigurationType & {
  presetId: string;
};
