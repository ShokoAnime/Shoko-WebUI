import React from 'react';

import useBadges from '@/components/Configuration/hooks/useBadges';
import useVisibility from '@/components/Configuration/hooks/useVisibility';
import Checkbox from '@/components/Input/Checkbox';
import { useReference } from '@/core/schema';
import useEventCallback from '@/hooks/useEventCallback';

import type { AnySchemaProps } from '@/components/Configuration/AnySchema';

function BooleanInput(props: AnySchemaProps): React.JSX.Element | null {
  const { schema } = props;
  const resolvedSchema = useReference(props.rootSchema, schema);
  const title = schema.title ?? resolvedSchema.title ?? props.path[props.path.length - 1].toString() ?? '<unknown>';
  const description = schema.description ?? resolvedSchema.description ?? '';
  const onChange = useEventCallback((event: React.ChangeEvent<HTMLInputElement>) =>
    props.updateField(props.path, event.target.checked, props.schema, props.rootSchema)
  );
  const visibility = useVisibility(
    resolvedSchema,
    props.parentConfig,
    props.advancedMode,
    props.loadedEnvironmentVariables,
  );
  const badges = useBadges(resolvedSchema, props.path, props.loadedEnvironmentVariables, props.restartPendingFor);
  const isDisabled = visibility === 'disabled';
  const isReadOnly = visibility === 'read-only';
  return (
    <div>
      <Checkbox
        justify
        readOnly={isReadOnly}
        disabled={isDisabled}
        label={
          <>
            {title}
            {isReadOnly && <span className="self-center text-xs opacity-65">(Read-Only)</span>}
            {badges}
          </>
        }
        labelClassName="flex gap-x-1.5"
        id={props.path.join('.')}
        isChecked={props.config as boolean}
        onChange={onChange}
      />
      <div className="mt-1 text-sm text-panel-text opacity-65">{description}</div>
    </div>
  );
}

export default BooleanInput;
