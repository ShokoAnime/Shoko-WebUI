import React from 'react';

import FieldSetSectionContainer from '@/components/Configuration/SectionContainer/FieldSetSectionContainer';
import MinimalSectionContainer from '@/components/Configuration/SectionContainer/MinimalSectionContainer';
import TabSectionContainer from '@/components/Configuration/SectionContainer/TabSectionContainer';
import UnableToRenderSchema from '@/components/Configuration/UnableToRenderSchema';
import { useReference } from '@/core/schema';

import type { AnySchemaProps } from '@/components/Configuration/AnySchema';
import type { SectionsConfigurationUiDefinitionType } from '@/core/react-query/configuration/types';

function AnySectionContainer(props: AnySchemaProps): React.JSX.Element {
  const resolvedSchema = useReference(props.rootSchema, props.schema);
  const uiDefinition = resolvedSchema['x-uiDefinition'] as SectionsConfigurationUiDefinitionType;
  switch (uiDefinition.sectionType) {
    case 'field-set':
      return (
        <FieldSetSectionContainer
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
    case 'tab':
      return (
        <TabSectionContainer
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
    case 'minimal':
      return (
        <MinimalSectionContainer
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
      return <UnableToRenderSchema type="Invalid Section Container" path={props.path} schema={resolvedSchema} />;
  }
}

export default AnySectionContainer;
