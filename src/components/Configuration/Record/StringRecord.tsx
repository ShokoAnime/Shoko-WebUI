import React from 'react';

import UnableToRenderSchema from '@/components/Configuration/UnableToRenderSchema';

import type { AnySchemaProps } from '@/components/Configuration/AnySchema';

function StringRecord(props: AnySchemaProps): React.JSX.Element | null {
  return <UnableToRenderSchema type="Record (String)" schema={props.schema} path={props.path} />;
}

export default StringRecord;
