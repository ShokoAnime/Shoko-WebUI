import React, { useMemo } from 'react';
import { map } from 'lodash';

import useBadges from '@/components/Configuration/hooks/useBadges';
import useVisibility from '@/components/Configuration/hooks/useVisibility';
import Checkbox from '@/components/Input/Checkbox';
import { useReference } from '@/core/schema';

import type { AnySchemaProps } from '@/components/Configuration/AnySchema';

let idCount = 0;

function BooleanRecord(props: AnySchemaProps): React.JSX.Element | null {
  const resolvedSchema = useReference(props.rootSchema, props.schema);
  // eslint-disable-next-line no-plusplus
  const prefix = useMemo(() => `list-${idCount++}-`, []);
  const title = props.schema.title ?? resolvedSchema.title ?? props.path[props.path.length - 1]?.toString()
    ?? '<unknown>';
  const description = props.schema.description ?? resolvedSchema.description ?? '';
  const values = props.config as Record<string, boolean>;
  const visibility = useVisibility(
    resolvedSchema,
    props.parentConfig,
    props.modes,
    props.loadedEnvironmentVariables,
  );
  const badges = useBadges(resolvedSchema, props.path, props.loadedEnvironmentVariables, props.restartPendingFor);
  const isDisabled = visibility === 'disabled';
  const isReadOnly = visibility === 'read-only';

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    const { id } = event.target;
    const key = id.substring(prefix.length);
    props.updateField(props.path, { ...values, [key]: checked }, props.schema, props.rootSchema);
  };

  return (
    <div>
      <div className="mt-2 flex justify-between">
        <span className="flex gap-x-1.5">
          {title}
          {isReadOnly && <span className="self-center text-xs opacity-65">(Read-Only)</span>}
          {badges}
        </span>
      </div>
      <div className="mt-2 flex min-h-10 rounded-lg border border-panel-border bg-panel-input px-4 py-2">
        <div className="grow">
          {map(values, (value, key) => (
            <Checkbox
              key={key}
              readOnly={isReadOnly}
              disabled={isDisabled}
              id={prefix + key}
              data-id={value}
              isChecked={value}
              onChange={handleInputChange}
              label={key}
              justify
            />
          ))}
        </div>
      </div>
      <div className="mt-1 text-sm text-panel-text opacity-65">{description}</div>
    </div>
  );
}

export default BooleanRecord;
