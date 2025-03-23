import React from 'react';

import UnableToRenderSchema from '@/components/Configuration/UnableToRenderSchema';

import type { AnySchemaProps } from '@/components/Configuration/AnySchema';

function ComplexRecord(props: AnySchemaProps): React.JSX.Element | null {
  // TODO: implement this when we get need it.
  return <UnableToRenderSchema type="Record (Complex)" schema={props.schema} path={props.path} />;
}

export default ComplexRecord;
