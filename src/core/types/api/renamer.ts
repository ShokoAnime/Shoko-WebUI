import type { ConfigurationInfoType } from "./configuration";
import type { PluginInfoType } from "./plugin";

export type RelocationProviderInfoType = {
  ID: string;
  Version: string;
  Name: string;
  Description: string | null;
  SupportsUnrecognized: boolean;
  SupportsIncompleteMetadata: boolean;
  SupportsMoving: boolean;
  SupportsRenaming: boolean;
  Configuration: ConfigurationInfoType | null;
  Plugin: PluginInfoType;
};

export type RelocationPipeType = {
  ID: string;
  ProviderID: string;
  Name: string;
  IsDefault: boolean;
  IsUsable: boolean;
  HasConfiguration: boolean;
  Provider: RelocationProviderInfoType | null;
};

export type RelocationResultType = {
  FileID: number;
  FileLocationID: number | undefined;
  IsSuccess: true;
  IsPreview: true | undefined;
  PipeName?: string;
  IsRelocated: boolean;
  ManagedFolderID: number;
  RelativePath: string;
  AbsolutePath: string;
} | {
  FileID: number;
  IsSuccess: false;
  IsPreview: true | undefined;
  ErrorMessage: string;
};
