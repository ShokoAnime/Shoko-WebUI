import type { ConfigurationInfoType } from '@/core/types/api/configuration';
import type { PluginInfoType } from '@/core/types/api/plugin';

export type RelocationProviderType = {
  ID: string;
  Version: string;
  Name: string;
  Description: string;
  SupportsUnrecognized: boolean;
  SupportsIncompleteMetadata: boolean;
  SupportsMoving: boolean;
  SupportsRenaming: boolean;
  Configuration?: ConfigurationInfoType;
  Plugin: PluginInfoType;
};

export type RelocationPresetType = {
  ID: string;
  ProviderID: string;
  Name: string;
  IsDefault: boolean;
  IsUsable: boolean;
  HasConfiguration: boolean;
};

export type RelocationResultType = {
  FileID: number;
  PresetName?: string;
  FileLocationID?: number;
  ManagedFolderID?: number;
  IsSuccess: boolean;
  IsRelocated?: boolean;
  IsPreview?: boolean;
  ErrorMessage?: string;
  RelativePath?: string;
  AbsolutePath?: string;
};

export type RelocationConfigurationType = Record<string, unknown>;
