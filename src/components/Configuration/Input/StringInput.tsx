import React, { useMemo } from 'react';
import cx from 'classnames';

import useBadges from '@/components/Configuration/hooks/useBadges';
import useVisibility from '@/components/Configuration/hooks/useVisibility';
import InputSmall from '@/components/Input/InputSmall';
import { useReference } from '@/core/schema';
import useEventCallback from '@/hooks/useEventCallback';

import type { AnySchemaProps } from '@/components/Configuration/AnySchema';
import type { BasicConfigurationUiDefinitionType } from '@/core/react-query/configuration/types';

function StringInput(props: AnySchemaProps): React.JSX.Element | null {
  const resolvedSchema = useReference(props.rootSchema, props.schema);
  const title = props.schema.title ?? resolvedSchema.title ?? props.path[props.path.length - 1] ?? '<unknown>';
  const description = props.schema.description ?? resolvedSchema.description ?? '';
  const onChange = useEventCallback((event: React.ChangeEvent<HTMLInputElement>) =>
    props.updateField(props.path, event.target.value, props.schema, props.rootSchema)
  );
  const isPassword = resolvedSchema.format === 'password'
    || resolvedSchema['x-uiDefinition']?.elementType === 'password';
  const size = useMemo(() => {
    const uiDefinition = props.schema['x-uiDefinition'] as BasicConfigurationUiDefinitionType;
    if (uiDefinition.elementSize === 'full') {
      return 'w-full';
    }
    if (uiDefinition.elementSize === 'large') {
      return 'w-60';
    }
    if (uiDefinition.elementSize === 'small') {
      return 'w-16';
    }
    return 'w-32';
  }, [props.schema]);
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
          value={(props.config as string | null) ?? ''}
          type={isPassword ? 'password' : 'text'}
          onChange={onChange}
          className={cx('px-3 py-1', size)}
        />
      </div>
      <div className="mt-1 text-sm text-panel-text opacity-65">{description}</div>
    </div>
  );
}

export default StringInput;
