import React from 'react';

import DropdownSectionContainerList from '@/components/Configuration/List/DropdownSectionContainerList';
import EnumCheckboxList from '@/components/Configuration/List/EnumCheckboxList';
import EnumList from '@/components/Configuration/List/EnumList';
import FloatList from '@/components/Configuration/List/FloatList';
import IntegerList from '@/components/Configuration/List/IntegerList';
import SectionContainerList from '@/components/Configuration/List/SectionContainerList';
import StringList from '@/components/Configuration/List/StringList';
import TabSectionContainerList from '@/components/Configuration/List/TabSelectionContainerList';
import UnableToRenderSchema from '@/components/Configuration/UnableToRenderSchema';
import { useListReference, useReference } from '@/core/schema';

import type { AnySchemaProps } from '@/components/Configuration/AnySchema';
import type { ListConfigurationUiDefinitionType } from '@/core/react-query/configuration/types';

function AnyList(props: AnySchemaProps): React.JSX.Element {
  const resolvedSchema = useReference(props.rootSchema, props.schema);
  const childItem = useListReference(props.rootSchema, resolvedSchema);
  const childType = childItem.type instanceof Array
    ? childItem.type.find(typ => typ !== 'null') ?? 'null'
    : childItem.type ?? 'null';
  const uiDefinition = resolvedSchema['x-uiDefinition'] as ListConfigurationUiDefinitionType;
  switch (uiDefinition.listType) {
    case 'enum-checkbox':
      if (uiDefinition.listElementType !== 'enum') {
        return <UnableToRenderSchema type="Invalid Checkbox List" path={props.path} schema={resolvedSchema} />;
      }

      return (
        <EnumCheckboxList
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

    case 'complex-dropdown':
      if (uiDefinition.listElementType !== 'section-container') {
        return <UnableToRenderSchema type="Invalid Dropdown List" path={props.path} schema={resolvedSchema} />;
      }

      return (
        <DropdownSectionContainerList
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

    case 'complex-tab':
      if (uiDefinition.listElementType !== 'section-container') {
        return <UnableToRenderSchema type="Invalid Tab List" path={props.path} schema={resolvedSchema} />;
      }

      return (
        <TabSectionContainerList
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
      switch (uiDefinition.listElementType) {
        case 'record':
          return <UnableToRenderSchema type="Record (Any) List" path={props.path} schema={resolvedSchema} />;

        case 'section-container':
          return (
            <SectionContainerList
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

        case 'enum':
          return (
            <EnumList
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

        default: {
          switch (childType) {
            case 'integer':
              return (
                <IntegerList
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
                <FloatList
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
                <StringList
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
              return <UnableToRenderSchema type="Unknown List" path={props.path} schema={resolvedSchema} />;
          }
        }
      }
  }
}

export default AnyList;
