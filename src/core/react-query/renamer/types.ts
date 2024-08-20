import type { Operation } from 'fast-json-patch';

type RenamerBaseType = {
  RenamerID: string;
  Version?: string;
  Name: string;
  Description: string;
  Enabled: boolean;
  DefaultSettings?: RenamerConfigSettingsType[];
};

export type RenamerResponseType = RenamerBaseType & {
  Settings?: RenamerSettingsType[];
};

export type RenamerType = RenamerBaseType & {
  Settings?: Record<string, RenamerSettingsType>;
};

export type RenamerSettingsType = {
  Name: string;
  Type: string;
  Description?: string;
  Language?: CodeLanguageType;
  SettingType: SettingTypeType;
  MinimumValue?: number;
  MaximumValue?: number;
};

type CodeLanguageType =
  | 'PlainText'
  | 'CSharp'
  | 'Java'
  | 'JavaScript'
  | 'TypeScript'
  | 'Lua'
  | 'Python'
  | 'Ini'
  | 'Json'
  | 'Yaml'
  | 'Xml';

export type SettingTypeType =
  | 'Auto'
  | 'Code'
  | 'Text'
  | 'LargeText'
  | 'Integer'
  | 'Decimal'
  | 'Boolean';

export type RenamerConfigSettingsType = {
  Name: string;
  Value: string | number | boolean;
};

type RenamerConfigBaseType = {
  RenamerID: string;
  Name: string;
};

export type RenamerConfigResponseType = RenamerConfigBaseType & {
  Settings?: RenamerConfigSettingsType[];
};

export type RenamerConfigType = RenamerConfigBaseType & {
  Settings?: Record<string, RenamerConfigSettingsType>;
};

export type RenamerResultType = {
  FileID: number;
  FileLocationID?: number;
  ConfigName?: string;
  ImportFolderID?: number;
  IsSuccess: boolean;
  IsRelocated?: boolean;
  IsPreview?: boolean;
  ErrorMessage?: string;
  RelativePath?: string;
  AbsolutePath?: string;
};

export type RenamerRelocateBaseRequestType = {
  move?: boolean;
  rename?: boolean;
  FileIDs: number[];
};

export type RenamerPreviewRequestType = RenamerRelocateBaseRequestType & {
  Config: RenamerConfigResponseType;
};

export type RenamerRelocateRequestType = RenamerRelocateBaseRequestType & {
  configName: string;
  deleteEmptyDirectories?: boolean;
};

export type RenamerPatchRequestType = {
  configName: string;
  operations: Operation[];
};
