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
      return <EnumRecord {...props} />;

    default:
      switch (childType) {
        case 'boolean':
          return <BooleanRecord {...props} />;

        case 'string':
          return <StringRecord {...props} />;

        case 'integer':
          return <IntegerRecord {...props} />;

        case 'number':
          return <FloatRecord {...props} />;

        case 'array':
        case 'object':
          return <ComplexRecord {...props} />;

        default:
          return <UnableToRenderSchema type="Record (Any)" schema={props.schema} path={props.path} />;
      }
  }
}

export default AnyRecord;
