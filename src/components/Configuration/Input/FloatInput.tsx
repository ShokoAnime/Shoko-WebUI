import React, { useMemo } from 'react';
import cx from 'classnames';

import useBadges from '@/components/Configuration/hooks/useBadges';
import useVisibility from '@/components/Configuration/hooks/useVisibility';
import InputSmall from '@/components/Input/InputSmall';
import { createDefaultItemForSchema, useReference } from '@/core/schema';
import useEventCallback from '@/hooks/useEventCallback';

import type { AnySchemaProps } from '@/components/Configuration/AnySchema';
import type { BasicConfigurationUiDefinitionType } from '@/core/react-query/configuration/types';

function FloatInput(props: AnySchemaProps): React.JSX.Element | null {
  const { schema } = props;
  const resolvedSchema = useReference(props.rootSchema, schema);
  const title = schema.title ?? resolvedSchema.title ?? props.path[props.path.length - 1] ?? '<unknown>';
  const description = schema.description ?? resolvedSchema.description ?? '';
  const onChange = useEventCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    let { value } = event.target;
    if (value === '') {
      value = createDefaultItemForSchema(props.rootSchema, resolvedSchema)?.toString() ?? '0';
    }
    props.updateField(props.path, value, props.schema, props.rootSchema);
  });
  const min = resolvedSchema.minimum;
  const max = resolvedSchema.maximum;
  const visibility = useVisibility(
    resolvedSchema,
    props.parentConfig,
    props.modes,
    props.loadedEnvironmentVariables,
  );
  const badges = useBadges(resolvedSchema, props.path, props.loadedEnvironmentVariables, props.restartPendingFor);
  const isDisabled = visibility === 'disabled';
  const isReadOnly = visibility === 'read-only';
  const size = useMemo(() => {
    const uiDefinition = schema['x-uiDefinition'] as BasicConfigurationUiDefinitionType;
    if (uiDefinition.elementSize === 'full') {
      return 'w-full';
    }
    if (uiDefinition.elementSize === 'large') {
      return 'w-20';
    }
    if (uiDefinition.elementSize === 'small') {
      return 'w-11';
    }
    return 'w-16';
  }, [schema]);
  return (
    <div>
      <div
        className={cx(
          'flex justify-between transition-opacity',
          size === 'w-full' && 'flex-col',
          isDisabled && 'opacity-65',
        )}
      >
        <span className={cx('flex gap-x-1.5', size !== 'w-full' && 'place-self-center')}>
          {title}
          {isReadOnly && <span className="self-center text-xs opacity-65">(Read-Only)</span>}
          {badges}
        </span>
        <InputSmall
          disabled={isDisabled || isReadOnly}
          id={props.path.join('.')}
          value={(props.config as number | null) ?? 0}
          type="number"
          onChange={onChange}
          className={cx('px-3 py-1', size, size !== 'w-full' && 'text-center')}
          min={min}
          max={max}
          step={0.01}
        />
      </div>
      <div className="mt-1 text-sm text-panel-text opacity-65">{description}</div>
    </div>
  );
}

export default FloatInput;
