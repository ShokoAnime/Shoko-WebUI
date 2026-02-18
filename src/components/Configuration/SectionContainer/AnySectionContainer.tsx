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
      return <FieldSetSectionContainer {...props} />;
    case 'tab':
      return <TabSectionContainer {...props} />;
    case 'minimal':
      return <MinimalSectionContainer {...props} />;
    case 'checkbox':
      return <UnableToRenderSchema type="Checkbox Section Container" path={props.path} schema={resolvedSchema} />;
    default:
      return <UnableToRenderSchema type="Invalid Section Container" path={props.path} schema={resolvedSchema} />;
  }
}

export default AnySectionContainer;
