import type { PluginInfoType } from '@/core/types/api/plugin';

export type ConfigurationInfoType = {
  ID: string;
  Name: string;
  RestartPendingFor: string[];
  LoadedEnvironmentVariables: string[];
  Description?: string;
  IsHidden: boolean;
  IsBase: boolean;
  HasCustomActions: boolean;
  HasCustomNewFactory: boolean;
  HasCustomValidation: boolean;
  HasCustomSave: boolean;
  HasCustomLoad: boolean;
  HasLiveEdit: boolean;
  Plugin: PluginInfoType;
};

// ---- Dynamic UI schema types (JSON Schema + x-uiDefinition) ----

export type UiVisibilityType = {
  default: 'hidden' | 'read-only' | 'visible';
  advanced: boolean;
  disableToggle?: { inverseCondition: boolean, path: string, value: unknown };
  toggle?: {
    path: string;
    value: unknown;
    visibility: 'hidden' | 'read-only' | 'visible';
  };
};

export type UiDefinitionType = {
  badge?: { name: string, theme: string };
  codeAutoFormatOnLoad?: boolean;
  codeLanguage?:
    | 'CSharp'
    | 'Ini'
    | 'Java'
    | 'JavaScript'
    | 'Json'
    | 'Lua'
    | 'PlainText'
    | 'Python'
    | 'TypeScript'
    | 'Xml'
    | 'Yaml';
  deniedValues?: unknown[];
  elementSize: 'full' | 'large' | 'normal' | 'small';
  elementType:
    | 'auto'
    | 'code-block'
    | 'enum'
    | 'list'
    | 'password'
    | 'record'
    | 'section-container'
    | 'select'
    | 'text-area';
  enumDefinitions?: { alias: string, aliasValues: string, description: string, title: string, value: string }[];
  enumIsFlag?: boolean;
  envVar?: string;
  envVarOverridable?: boolean;
  group?: string;
  listElementType?: string;
  listHideAddAction?: boolean;
  listHideRemoveAction?: boolean;
  listSortable?: boolean;
  listType?: string;
  listUniqueItems?: boolean;
  primaryKey?: boolean;
  recordElementType?: string;
  recordHideAddAction?: boolean;
  recordHideRemoveAction?: boolean;
  recordSortable?: boolean;
  recordType?: string;
  requiresRestart: boolean;
  sectionAppendFloatingAtEnd?: boolean;
  sectionName?: string;
  sectionType?: 'checkbox' | 'field-set' | 'minimal' | 'tab';
  selectElementType?: string;
  selectMultipleItems?: boolean;
  selectType?: string;
  showSaveAction?: boolean;
  structure?: Record<string, string>;
  visibility?: UiVisibilityType;
};

export type PropertySchemaType = {
  $ref?: string;
  additionalProperties?: PropertySchemaType;
  default?: unknown;
  description?: string;
  enum?: unknown[];
  format?: string;
  items?: PropertySchemaType;
  maximum?: number;
  maxLength?: number;
  minimum?: number;
  minLength?: number;
  pattern?: string;
  title?: string;
  type?: string | string[];
  'x-uiDefinition': UiDefinitionType;
};

export type FormSchemaType = {
  $schema?: string;
  description?: string;
  id?: string;
  properties: Record<string, PropertySchemaType>;
  title?: string;
  type: 'object';
  'x-uiDefinition': UiDefinitionType;
};
