import React, { useMemo } from 'react';
import cx from 'classnames';

import SelectComponent from '@/components/Configuration/Select/SelectComponent';
import useBadges from '@/components/Configuration/hooks/useBadges';
import useVisibility from '@/components/Configuration/hooks/useVisibility';
import { assertIsRequired, useReference } from '@/core/schema';
import useEventCallback from '@/hooks/useEventCallback';

import type { AnySchemaProps } from '@/components/Configuration/AnySchema';
import type { OptionType } from '@/components/Configuration/Select/SelectComponent';
import type { EnumConfigurationUiDefinitionType } from '@/core/react-query/configuration/types';

const NullValue = '$null$';

function EnumSelectorInput(props: AnySchemaProps): React.JSX.Element {
  const resolvedSchema = useReference(props.rootSchema, props.schema);
  const title = props.schema.title ?? resolvedSchema.title ?? props.path[props.path.length - 1] ?? '<unknown>';
  const description = props.schema.description ?? resolvedSchema.description ?? '';
  const onChange = useEventCallback((option: OptionType<string>) =>
    props.updateField(props.path, option.value === NullValue ? null : option.value, props.schema, props.rootSchema)
  );
  const visibility = useVisibility(
    props.schema,
    props.parentConfig,
    props.modes,
    props.loadedEnvironmentVariables,
  );
  const badges = useBadges(props.schema, props.path, props.loadedEnvironmentVariables, props.restartPendingFor);
  const isDisabled = visibility === 'disabled';
  const isReadOnly = visibility === 'read-only';
  const options = useMemo(() => {
    const uiDefinition = props.schema['x-uiDefinition'] as EnumConfigurationUiDefinitionType;
    const definitions = uiDefinition.deniedValues
      ? uiDefinition.enumDefinitions.filter(definition => !uiDefinition.deniedValues!.includes(definition.value))
      : uiDefinition.enumDefinitions.slice();
    // eslint-disable-next-line no-nested-ternary
    const required = assertIsRequired(props.schema, props.parentSchema, props.path[props.path.length - 1] as string);
    const defaultValue = props.schema.default || (props.schema.default === '' && definitions.some(definition => definition.value === '')) ?
      props.schema.default : null;
    if (!required) {
      definitions.unshift({
        value: NullValue,
        description: '',
        title: '-',
      });
    }
    const selectedValue = props.config === null ? NullValue : props.config;
    return definitions.map<OptionType<string>>(definition => ({
      label: definition.title,
      value: definition.value,
      default: definition.value === defaultValue,
      selected: definition.value === selectedValue,
    }));
  }, [props.schema, props.parentSchema, props.path, props.config]);
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
        <SelectComponent
          className={cx('flex-col', size)}
          disabled={isDisabled || isReadOnly}
          id={props.path.join('.')}
          values={options}
          onChange={onChange}
          serverControlled={props.serverControlled}
        />
      </div>
      <div className="mt-1 text-sm text-panel-text opacity-65">{description}</div>
    </div>
  );
}

export default EnumSelectorInput;
