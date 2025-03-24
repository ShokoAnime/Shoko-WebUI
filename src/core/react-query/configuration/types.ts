import type { ConfigurationInfoType } from '@/core/types/api/configuration';
import type { JSONSchema4 } from 'json-schema';

/**
 * The server will guarantee that the config in question is in-line with the
 * schema, because it will validate the config upon loading it before sending it
 * to the client.
 */
export type ConfigurationWithSchemaResultType = {
  config: unknown;
  info: ConfigurationInfoType;
  schema: JSONSchema4WithUiDefinition;
};

export type DisplayElementType = ConfigurationUiDefinitionType['elementType'];

export type DisplayVisibility = 'visible' | 'hidden' | 'read-only' | 'disabled';

export type DisplayElementSize = 'normal' | 'small' | 'large' | 'full';

export type DisplayColorTheme = 'default' | 'primary' | 'secondary' | 'important' | 'warning' | 'danger';

export type DisplaySectionType = 'field-set' | 'tab' | 'minimal';

export type DisplayButtonPosition = 'auto' | 'top' | 'bottom';

export type JSONSchema4WithUiDefinition<
  TUiDefinitionType extends ConfigurationUiDefinitionType = ConfigurationUiDefinitionType,
> = JSONSchema4 & { 'x-uiDefinition'?: TUiDefinitionType };

export type BaseConfigurationUiDefinitionType = {
  visibility?: VisibilityType;
  badge?: {
    name: string;
    theme: DisplayColorTheme;
  };
  requiresRestart?: boolean;
  sectionName?: string;
};

export type HasEnvironmentVariable = {
  envVar: undefined;
} | {
  envVar: string;
  envVarOverridable: boolean;
};

export type BasicConfigurationUiDefinitionType = BaseConfigurationUiDefinitionType & HasEnvironmentVariable & {
  elementType: 'auto' | 'text-area' | 'password';
  elementSize: DisplayElementSize;
};

export type SectionsConfigurationUiDefinitionType = BaseConfigurationUiDefinitionType & HasEnvironmentVariable & {
  elementType: 'section-container';
  sectionType: DisplaySectionType;
  sectionAppendFloatingAtEnd: boolean;
  actions: {
    hideSaveAction: boolean;
    customActions: CustomUiActionType[];
  };
};

export type ListConfigurationUiDefinitionType =
  | SimpleListConfigurationUiDefinitionType
  | ComplexListConfigurationUiDefinitionType;

export type SimpleListConfigurationUiDefinitionType = BaseConfigurationUiDefinitionType & HasEnvironmentVariable & {
  elementType: 'list';
  elementSize: DisplayElementSize;
  listType: 'auto' | 'enum-checkbox';
  listElementType: DisplayElementType;
  listSortable: boolean;
  listUniqueItems: boolean;
  listHideAddAction: boolean;
  listHideRemoveAction: boolean;
};

export type ComplexListConfigurationUiDefinitionType = BaseConfigurationUiDefinitionType & HasEnvironmentVariable & {
  elementType: 'list';
  elementSize: DisplayElementSize;
  listType: 'complex-dropdown' | 'complex-tab';
  listElementType: DisplayElementType;
  listSortable: boolean;
  listUniqueItems: boolean;
  listHideAddAction: boolean;
  listHideRemoveAction: boolean;
  primaryKey: string;
};

export type RecordConfigurationUiDefinitionType = BaseConfigurationUiDefinitionType & HasEnvironmentVariable & {
  elementType: 'record';
  elementSize: DisplayElementSize;
  recordElementType: DisplayElementType;
  recordElementSize: DisplayElementSize;
};

export type CodeEditorConfigurationUiDefinitionType = BaseConfigurationUiDefinitionType & HasEnvironmentVariable & {
  elementType: 'code-block';
  elementSize: DisplayElementSize;
  codeLanguage: string;
  codeAutoFormatOnLoad: boolean;
};

export type EnumConfigurationUiDefinitionType = BaseConfigurationUiDefinitionType & HasEnvironmentVariable & {
  elementType: 'enum';
  elementSize: DisplayElementSize;
  enumDefinitions: EnumDefinitionType[];
  enumIsFlag: boolean;
};

export type ConfigurationUiDefinitionType =
  | BasicConfigurationUiDefinitionType
  | ListConfigurationUiDefinitionType
  | RecordConfigurationUiDefinitionType
  | CodeEditorConfigurationUiDefinitionType
  | EnumConfigurationUiDefinitionType
  | SectionsConfigurationUiDefinitionType;

export type VisibilityType = {
  default: DisplayVisibility;
  advanced: boolean;
  toggle?: {
    path: string;
    value: unknown;
    visibility: DisplayVisibility;
  };
};

export type EnumDefinitionType = {
  title: string;
  description: string;
  value: string;
};

export type CustomUiActionType = {
  title: string;
  description: string;
  theme: DisplayColorTheme;
  position: DisplayButtonPosition;
  sectionName?: string;
  toggle?: {
    path: string;
    value: unknown;
  };
  inverseToggle: boolean;
  disableIfNoChanges: boolean;
};

export type ConfigurationActionResultType = {
  ShowDefaultSaveMessage: boolean;
  RefreshConfiguration: boolean;
  Messages: ConfigurationActionResultMessageType[];
};

export type ConfigurationActionResultMessageType = {
  Title?: string;
  Message: string;
  Theme: DisplayColorTheme;
};
