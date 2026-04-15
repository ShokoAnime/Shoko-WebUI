import type { PluginInfoType } from './plugin';

export type ConfigurationInfoType = {
  ID: string;
  Name: string;
  Description: string | null;
  IsHidden: boolean;
  IsBase: boolean;
  HasCustomNewFactory: boolean;
  HasCustomValidation: boolean;
  HasCustomActions: boolean;
  HasCustomSave: boolean;
  HasCustomLoad: boolean;
  HasLiveEdit: boolean;
  RestartPendingFor: string[];
  LoadedEnvironmentVariables: string[];
  Plugin: PluginInfoType;
};
