import React from 'react';

import BooleanInput from '@/components/Configuration/Input/BooleanInput';
import CodeBlockInput from '@/components/Configuration/Input/CodeBlockInput';
import EnumSelectorInput from '@/components/Configuration/Input/EnumSelectorInput';
import FloatInput from '@/components/Configuration/Input/FloatInput';
import IntegerInput from '@/components/Configuration/Input/IntegerInput';
import StringInput from '@/components/Configuration/Input/StringInput';
import TextAreaInput from '@/components/Configuration/Input/TextAreaInput';
import AnyList from '@/components/Configuration/List/AnyList';
import AnyRecord from '@/components/Configuration/Record/AnyRecord';
import AnySectionContainer from '@/components/Configuration/SectionContainer/AnySectionContainer';
import AnySelect from '@/components/Configuration/Select/AnySelect';
import UnableToRenderSchema from '@/components/Configuration/UnableToRenderSchema';
import useVisibility from '@/components/Configuration/hooks/useVisibility';
import { useReference } from '@/core/schema';

import type {
  ConfigurationUiDefinitionType,
  JSONSchema4WithUiDefinition,
} from '@/core/react-query/configuration/types';

export type AnySchemaProps = {
  config: unknown;
  parentConfig: unknown;
  rootConfig: unknown;
  schema: JSONSchema4WithUiDefinition;
  rootSchema: JSONSchema4WithUiDefinition;
  configHasChanged: boolean;
  renderHeader: boolean;
  path: (string | number)[];
  restartPendingFor: string[];
  loadedEnvironmentVariables: string[];
  serverControlled: boolean;
  modes: {
    advanced: boolean;
    debug: boolean;
  };
  defaultSave?: (() => void) | undefined;
  performAction?: (path: (string | number)[], action: string) => void;
  updateField: (
    path: (string | number)[],
    value: unknown,
    schema: JSONSchema4WithUiDefinition,
    rootSchema: JSONSchema4WithUiDefinition,
  ) => void;
};

function AnySchema(props: AnySchemaProps): React.JSX.Element | null {
  const resolvedSchema = useReference(props.rootSchema, props.schema);
  const type = resolvedSchema.type instanceof Array
    ? resolvedSchema.type.find(typ => typ !== 'null') ?? 'null'
    : resolvedSchema.type ?? 'null';
  const uiDefinition = Object.assign(
    { elementType: 'auto', elementSize: 'default' },
    props.schema['x-uiDefinition'],
    resolvedSchema['x-uiDefinition'],
  ) as ConfigurationUiDefinitionType;
  const visibility = useVisibility(
    props.schema,
    type === 'object' ? props.config : props.parentConfig,
    props.modes,
    props.loadedEnvironmentVariables,
  );
  const isVisible = visibility !== 'hidden';
  if (type === 'null' || type === 'any' || !isVisible) {
    return null;
  }
  switch (uiDefinition.elementType) {
    case 'select':
      return <AnySelect {...props} />;
    case 'section-container':
      return <AnySectionContainer {...props} />;
    case 'list':
      return <AnyList {...props} />;
    case 'record':
      return <AnyRecord {...props} />;
    default:
      break;
  }
  switch (type) {
    case 'boolean':
      return <BooleanInput {...props} />;
    case 'number':
      return <FloatInput {...props} />;
    case 'integer':
      return <IntegerInput {...props} />;
    case 'string':
      switch (uiDefinition.elementType) {
        case 'enum':
          return <EnumSelectorInput {...props} />;
        case 'text-area':
          return <TextAreaInput {...props} />;
        case 'code-block':
          return <CodeBlockInput {...props} />;
        default:
          break;
      }
      return <StringInput {...props} />;
    default:
      break;
  }
  return <UnableToRenderSchema type="Any" path={props.path} schema={resolvedSchema} />;
}

export default AnySchema;
