import React from 'react';

import BooleanRecord from '@/components/Configuration/Record/BooleanRecord';
import ComplexRecord from '@/components/Configuration/Record/ComplexRecord';
import EnumRecord from '@/components/Configuration/Record/EnumRecord';
import FloatRecord from '@/components/Configuration/Record/FloatRecord';
import IntegerRecord from '@/components/Configuration/Record/IntegerRecord';
import StringRecord from '@/components/Configuration/Record/StringRecord';
import UnableToRenderSchema from '@/components/Configuration/UnableToRenderSchema';
import { useDictReference, useReference } from '@/core/schema';

import type { AnySchemaProps } from '@/components/Configuration/AnySchema';
import type { RecordConfigurationUiDefinitionType } from '@/core/react-query/configuration/types';

function AnyRecord(props: AnySchemaProps): React.JSX.Element | null {
  const resolvedSchema = useReference(props.rootSchema, props.schema);
  const childItem = useDictReference(props.rootSchema, resolvedSchema);
  const childType = childItem.type instanceof Array
    ? childItem.type.find(typ => typ !== 'null') ?? 'null'
    : childItem.type ?? 'null';
  const uiDefinition = resolvedSchema['x-uiDefinition'] as RecordConfigurationUiDefinitionType;
  switch (uiDefinition.recordElementType) {
    case 'enum':
      return (
        <EnumRecord
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

    default:
      switch (childType) {
        case 'boolean':
          return (
            <BooleanRecord
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

        case 'string':
          return (
            <StringRecord
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

        case 'integer':
          return (
            <IntegerRecord
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

        case 'number':
          return (
            <FloatRecord
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

        case 'array':
        case 'object':
          return (
            <ComplexRecord
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

        default:
          return <UnableToRenderSchema type="Record (Any)" schema={props.schema} path={props.path} />;
      }
  }
}

export default AnyRecord;
