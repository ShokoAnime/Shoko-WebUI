export type RenamerType = {
  RenamerID: string;
  Version?: string;
  Name: string;
  Description: string;
  Enabled: boolean;
  DefaultSettings?: RenamerConfigSettingsType[];
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

type SettingTypeType =
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

export type RenamerConfigBaseType = {
  RenamerID: string;
  Name: string;
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
