import React from 'react';

import SingleItemSelect from '@/components/Configuration/Select/SingleItemSelect';
import UnableToRenderSchema from '@/components/Configuration/UnableToRenderSchema';

import type { AnySchemaProps } from '@/components/Configuration/AnySchema';
import type { SelectConfigurationUiDefinitionType } from '@/core/react-query/configuration/types';

function AnySelect(props: AnySchemaProps): React.JSX.Element {
  const resolvedSchema = props.schema;
  const uiDefinition = resolvedSchema['x-uiDefinition'] as SelectConfigurationUiDefinitionType;
  switch (uiDefinition.selectType) {
    case 'auto':
      if (uiDefinition.selectMultipleItems) {
        return <UnableToRenderSchema type="Multi Item Auto Select" path={props.path} schema={resolvedSchema} />;
      }
      return <SingleItemSelect {...props} />;
    case 'checkbox-list':
      if (uiDefinition.selectMultipleItems) {
        return (
          <UnableToRenderSchema type="Multi Item Checkbox List Select" path={props.path} schema={resolvedSchema} />
        );
      }
      return <UnableToRenderSchema type="Single Item Checkbox List Select" path={props.path} schema={resolvedSchema} />;
    case 'flat-list':
      if (uiDefinition.selectMultipleItems) {
        return <UnableToRenderSchema type="Multi Item Flat List Select" path={props.path} schema={resolvedSchema} />;
      }
      return <UnableToRenderSchema type="Single Item Flat List Select" path={props.path} schema={resolvedSchema} />;
    default:
      return <UnableToRenderSchema type="Invalid Select" path={props.path} schema={resolvedSchema} />;
  }
}

export default AnySelect;
