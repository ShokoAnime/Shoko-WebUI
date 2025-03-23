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
import SectionContainer from '@/components/Configuration/SectionContainer/AnySectionContainer';
import UnableToRenderSchema from '@/components/Configuration/UnableToRenderSchema';
import useVisibility from '@/components/Configuration/hooks/useVisibility';
import { useReference } from '@/core/schema';

import type {
  ConfigurationUiDefinitionType,
  JSONSchema4WithUiDefinition,
} from '@/core/react-query/configuration/types';

export type AnySchemaProps = {
  config: unknown;
  configHasChanged: boolean;
  parentConfig: unknown;
  renderHeader: boolean;
  path: (string | number)[];
  restartPendingFor: string[];
  loadedEnvironmentVariables: string[];
  advancedMode: boolean;
  performAction: (path: (string | number)[], action: string) => void;
  rootSchema: JSONSchema4WithUiDefinition;
  schema: JSONSchema4WithUiDefinition;
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
    props.advancedMode,
    props.loadedEnvironmentVariables,
  );
  const isVisible = visibility !== 'hidden';
  if (type === 'null' || type === 'any' || !isVisible) return null;

  if (uiDefinition.elementType === 'section-container') {
    return (
      <SectionContainer
        rootSchema={props.rootSchema}
        schema={resolvedSchema}
        parentConfig={props.parentConfig}
        config={props.config}
        path={props.path}
        restartPendingFor={props.restartPendingFor}
        loadedEnvironmentVariables={props.loadedEnvironmentVariables}
        advancedMode={props.advancedMode}
        performAction={props.performAction}
        updateField={props.updateField}
        renderHeader={props.renderHeader}
        configHasChanged={props.configHasChanged}
      />
    );
  }

  if (uiDefinition.elementType === 'list') {
    return (
      <AnyList
        rootSchema={props.rootSchema}
        schema={resolvedSchema}
        parentConfig={props.parentConfig}
        config={props.config}
        path={props.path}
        restartPendingFor={props.restartPendingFor}
        loadedEnvironmentVariables={props.loadedEnvironmentVariables}
        advancedMode={props.advancedMode}
        performAction={props.performAction}
        updateField={props.updateField}
        renderHeader={props.renderHeader}
        configHasChanged={props.configHasChanged}
      />
    );
  }

  if (uiDefinition.elementType === 'record') {
    return (
      <AnyRecord
        rootSchema={props.rootSchema}
        schema={resolvedSchema}
        parentConfig={props.parentConfig}
        config={props.config}
        path={props.path}
        restartPendingFor={props.restartPendingFor}
        loadedEnvironmentVariables={props.loadedEnvironmentVariables}
        advancedMode={props.advancedMode}
        performAction={props.performAction}
        updateField={props.updateField}
        renderHeader={props.renderHeader}
        configHasChanged={props.configHasChanged}
      />
    );
  }

  switch (type) {
    case 'boolean':
      return (
        <BooleanInput
          rootSchema={props.rootSchema}
          schema={props.schema}
          parentConfig={props.parentConfig}
          config={props.config}
          path={props.path}
          restartPendingFor={props.restartPendingFor}
          loadedEnvironmentVariables={props.loadedEnvironmentVariables}
          advancedMode={props.advancedMode}
          performAction={props.performAction}
          updateField={props.updateField}
          renderHeader={props.renderHeader}
          configHasChanged={props.configHasChanged}
        />
      );
    case 'number':
      return (
        <FloatInput
          rootSchema={props.rootSchema}
          schema={props.schema}
          parentConfig={props.parentConfig}
          config={props.config}
          path={props.path}
          restartPendingFor={props.restartPendingFor}
          loadedEnvironmentVariables={props.loadedEnvironmentVariables}
          advancedMode={props.advancedMode}
          performAction={props.performAction}
          updateField={props.updateField}
          renderHeader={props.renderHeader}
          configHasChanged={props.configHasChanged}
        />
      );
    case 'integer':
      return (
        <IntegerInput
          rootSchema={props.rootSchema}
          schema={props.schema}
          parentConfig={props.parentConfig}
          config={props.config}
          path={props.path}
          restartPendingFor={props.restartPendingFor}
          loadedEnvironmentVariables={props.loadedEnvironmentVariables}
          advancedMode={props.advancedMode}
          performAction={props.performAction}
          updateField={props.updateField}
          renderHeader={props.renderHeader}
          configHasChanged={props.configHasChanged}
        />
      );
    case 'string':
      switch (uiDefinition.elementType) {
        case 'enum':
          return (
            <EnumSelectorInput
              rootSchema={props.rootSchema}
              schema={props.schema}
              parentConfig={props.parentConfig}
              config={props.config}
              path={props.path}
              restartPendingFor={props.restartPendingFor}
              loadedEnvironmentVariables={props.loadedEnvironmentVariables}
              advancedMode={props.advancedMode}
              performAction={props.performAction}
              updateField={props.updateField}
              renderHeader={props.renderHeader}
              configHasChanged={props.configHasChanged}
            />
          );
        case 'text-area':
          return (
            <TextAreaInput
              rootSchema={props.rootSchema}
              schema={props.schema}
              parentConfig={props.parentConfig}
              config={props.config}
              path={props.path}
              restartPendingFor={props.restartPendingFor}
              loadedEnvironmentVariables={props.loadedEnvironmentVariables}
              advancedMode={props.advancedMode}
              performAction={props.performAction}
              updateField={props.updateField}
              renderHeader={props.renderHeader}
              configHasChanged={props.configHasChanged}
            />
          );
        case 'code-block':
          return (
            <CodeBlockInput
              rootSchema={props.rootSchema}
              schema={props.schema}
              parentConfig={props.parentConfig}
              config={props.config}
              path={props.path}
              restartPendingFor={props.restartPendingFor}
              loadedEnvironmentVariables={props.loadedEnvironmentVariables}
              advancedMode={props.advancedMode}
              performAction={props.performAction}
              updateField={props.updateField}
              renderHeader={props.renderHeader}
              configHasChanged={props.configHasChanged}
            />
          );
        default:
          return (
            <StringInput
              rootSchema={props.rootSchema}
              schema={props.schema}
              parentConfig={props.parentConfig}
              config={props.config}
              path={props.path}
              restartPendingFor={props.restartPendingFor}
              loadedEnvironmentVariables={props.loadedEnvironmentVariables}
              advancedMode={props.advancedMode}
              performAction={props.performAction}
              updateField={props.updateField}
              renderHeader={props.renderHeader}
              configHasChanged={props.configHasChanged}
            />
          );
      }
    default:
      return <UnableToRenderSchema type="Any" path={props.path} schema={resolvedSchema} />;
  }
}

export default AnySchema;
