import React, { useMemo } from 'react';
import cx from 'classnames';

import useBadges from '@/components/Configuration/hooks/useBadges';
import useVisibility from '@/components/Configuration/hooks/useVisibility';
import SelectSmall from '@/components/Input/SelectSmall';
import { useReference } from '@/core/schema';
import useEventCallback from '@/hooks/useEventCallback';

import type { AnySchemaProps } from '@/components/Configuration/AnySchema';
import type { EnumConfigurationUiDefinitionType } from '@/core/react-query/configuration/types';

function EnumSelectorInput(props: AnySchemaProps): React.JSX.Element {
  const resolvedSchema = useReference(props.rootSchema, props.schema);
  const title = props.schema.title ?? resolvedSchema.title ?? props.path[props.path.length - 1] ?? '<unknown>';
  const description = props.schema.description ?? resolvedSchema.description ?? '';
  const onChange = useEventCallback((event: React.ChangeEvent<HTMLSelectElement>) =>
    props.updateField(props.path, event.target.value, props.schema, props.rootSchema)
  );
  const visibility = useVisibility(
    props.schema,
    props.parentConfig,
    props.advancedMode,
    props.loadedEnvironmentVariables,
  );
  const badges = useBadges(props.schema, props.path, props.loadedEnvironmentVariables, props.restartPendingFor);
  const isDisabled = visibility === 'disabled';
  const isReadOnly = visibility === 'read-only';
  const options = useMemo(() => {
    const uiDefinition = props.schema['x-uiDefinition'] as EnumConfigurationUiDefinitionType;
    const definitions = uiDefinition.enumDefinitions;
    const defaultValue = props.schema.default ?? definitions[0].value;
    const isFlag = uiDefinition.enumIsFlag;
    return {
      isFlag,
      definitions: definitions.map(definition => (
        <option data-tooltip-id="tooltip" key={definition.value} value={definition.value}>
          {definition.title}
          {defaultValue === definition.value ? ' (Default)' : ''}
        </option>
      )),
    };
  }, [props.schema]);
  const size = useMemo(() => {
    const uiDefinition = props.schema['x-uiDefinition'] as EnumConfigurationUiDefinitionType;
    if (uiDefinition.elementSize === 'full') {
      return 'w-full';
    }
    return 'w-auto';
  }, [props.schema]);
  return (
    <div>
      <div className={cx('flex justify-between', size === 'w-full' && 'flex-col')}>
        <span
          className={cx(
            'flex gap-x-1.5 transition-opacity',
            size !== 'w-full' && 'place-self-center',
            isDisabled && 'opacity-65',
          )}
        >
          {title}
          {isReadOnly && <span className="self-center text-xs opacity-65">(Read-Only)</span>}
          {badges}
        </span>
        <SelectSmall
          className={cx('flex-col', size)}
          disabled={isDisabled || isReadOnly}
          id={props.path.join('.')}
          value={props.config as string | number}
          onChange={onChange}
        >
          {options.definitions}
        </SelectSmall>
      </div>
      <div className="mt-1 text-sm text-panel-text opacity-65">{description}</div>
    </div>
  );
}

export default EnumSelectorInput;
