import type { ConfigurationInfoType } from '@/core/types/api/configuration';
import type { Operation } from 'fast-json-patch';
import type { JSONSchema4 } from 'json-schema';

export type { ValidationResult } from 'json-schema';

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

export type DisplayVisibility = 'visible' | 'hidden' | 'read-only';

export type DisplayElementSize = 'normal' | 'small' | 'large' | 'full';

export type DisplayColorTheme = 'default' | 'primary' | 'secondary' | 'important' | 'warning' | 'danger';

export type DisplaySectionType = 'field-set' | 'tab' | 'minimal' | 'checkbox';

export type DisplayButtonPosition = 'auto' | 'top' | 'bottom';

export type DisplayStructureType = 'property' | 'method';

export type JSONSchema4WithUiDefinition<
  TUiDefinitionType extends ConfigurationUiDefinitionType = ConfigurationUiDefinitionType,
> = JSONSchema4 & { 'x-uiDefinition'?: TUiDefinitionType };

export type BaseConfigurationUiDefinitionType = {
  deniedValues?: unknown[];
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
  structure: Record<string, DisplayStructureType>;
  showSaveAction: boolean;
  actions: Record<string, CustomUiActionType>;
};

export type SelectConfigurationUiDefinitionType = BaseConfigurationUiDefinitionType & HasEnvironmentVariable & {
  elementType: 'select';
  elementSize: DisplayElementSize;
  selectType: 'auto' | 'flat-list' | 'checkbox-list';
  selectMultipleItems: boolean;
};

export type ListConfigurationUiDefinitionType =
  | SimpleListConfigurationUiDefinitionType
  | ComplexListConfigurationUiDefinitionType;

export type SimpleListConfigurationUiDefinitionType = BaseConfigurationUiDefinitionType & HasEnvironmentVariable & {
  group?: string;
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
  listType: 'complex-dropdown' | 'complex-tab' | 'complex-inline';
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
  | SelectConfigurationUiDefinitionType
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
    inverseCondition: boolean;
  };
  disableToggle?: {
    path: string;
    value: unknown;
    inverseCondition: boolean;
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
  icon?: string;
  sectionName?: string;
  toggle?: {
    path: string;
    value: unknown;
    inverseCondition: boolean;
  };
  disableToggle?: {
    path: string;
    value: unknown;
    inverseCondition: boolean;
  };
  disableIfNoChanges: boolean;
};

export type ConfigurationActionResultType = {
  ShowSaveMessage: boolean;
  Refresh: boolean;
  Messages: ConfigurationActionResultMessageType[];
  Redirect: ConfigurationActionRedirectType | null;
  PatchOperations: Operation[] | null;
};

export type ConfigurationActionResultMessageType = {
  Title?: string;
  Message: string;
  Theme: DisplayColorTheme;
};

export type ConfigurationActionRedirectType = {
  Location: string;
  OpenInNewTab: boolean;
};
