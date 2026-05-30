import React from 'react';

import UnableToRenderSchema from '@/components/Configuration/UnableToRenderSchema';

import type { AnySchemaProps } from '@/components/Configuration/AnySchema';

const FloatRecord = (props: AnySchemaProps): React.JSX.Element | null =>
  // TODO: implement this when we get need it.
  <UnableToRenderSchema type="Record (Float)" schema={props.schema} path={props.path} />;

export default FloatRecord;
