import React, { useMemo } from 'react';
import cx from 'classnames';

import useBadges from '@/components/Configuration/hooks/useBadges';
import useVisibility from '@/components/Configuration/hooks/useVisibility';
import { pathToString, useReference } from '@/core/schema';
import useEventCallback from '@/hooks/useEventCallback';

import type { AnySchemaProps } from '@/components/Configuration/AnySchema';
import type { BasicConfigurationUiDefinitionType } from '@/core/react-query/configuration/types';

function TextAreaInput(props: AnySchemaProps): React.JSX.Element | null {
  const resolvedSchema = useReference(props.rootSchema, props.schema);
  const title = props.schema.title ?? resolvedSchema.title ?? props.path[props.path.length - 1] ?? '<unknown>';
  const description = props.schema.description ?? resolvedSchema.description ?? '';
  const onChange = useEventCallback((event: React.ChangeEvent<HTMLTextAreaElement>) =>
    props.updateField(props.path, event.target.value, props.schema, props.rootSchema)
  );
  const size = useMemo(() => {
    const uiDefinition = props.schema['x-uiDefinition'] as BasicConfigurationUiDefinitionType;
    if (uiDefinition.elementSize === 'full') {
      return 'h-64';
    }
    if (uiDefinition.elementSize === 'large') {
      return 'h-32';
    }
    if (uiDefinition.elementSize === 'small') {
      return 'h-8';
    }
    return 'h-16';
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
      <div className={cx('flex flex-col justify-between transition-opacity', isDisabled && 'opacity-65')}>
        <span className="flex gap-x-1.5">
          {title}
          {isReadOnly && <span className="self-center text-xs opacity-65">(Read-Only)</span>}
          {badges}
        </span>
        <textarea
          className={cx(
            'w-auto appearance-none rounded-lg border border-panel-border bg-panel-input px-3 py-1 text-sm transition ease-in-out focus:shadow-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-panel-icon-action',
            size,
          )}
          id={`${pathToString(props.path)}-input`}
          value={(props.config as string | null) ?? ''}
          onChange={onChange}
          disabled={isDisabled || isReadOnly}
        />
      </div>
      <div className="mt-1 text-sm text-panel-text opacity-65">{description}</div>
    </div>
  );
}

export default TextAreaInput;
