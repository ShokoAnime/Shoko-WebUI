import React from 'react';

import type { JSONSchema4WithUiDefinition } from '@/core/react-query/configuration/types';

export type UnableToRenderSchemaProps = {
  path: (string | number)[];
  schema: JSONSchema4WithUiDefinition;
  type: string;
};

function UnableToRenderSchema(props: UnableToRenderSchemaProps): React.JSX.Element | null {
  const title = props.schema.title ?? props.schema.title ?? props.path[props.path.length - 1] ?? '<unknown>';
  return (
    <span>
      {props.type}
      :&nbsp;
      {title}
      &nbsp;(Path:&nbsp;
      {JSON.stringify(props.path)}
      )
    </span>
  );
}

export default UnableToRenderSchema;
