import React, { useMemo } from 'react';
import cx from 'classnames';
import { cloneDeep } from 'lodash';

import useBadges from '@/components/Configuration/hooks/useBadges';
import useVisibility from '@/components/Configuration/hooks/useVisibility';
import useEventCallback from '@/hooks/useEventCallback';

import SelectComponent from './SelectComponent';

import type { OptionGroupType, OptionType } from './SelectComponent';
import type { AnySchemaProps } from '@/components/Configuration/AnySchema';
import type { SelectConfigurationUiDefinitionType } from '@/core/react-query/configuration/types';

function SingleItemSelect(props: AnySchemaProps): React.JSX.Element {
  const title = props.schema.title ?? props.path[props.path.length - 1] ?? '<unknown>';
  const description = props.schema.description ?? '';
  const config = props.config as { groups: OptionGroupType[], options: OptionType<unknown>[] } | null | undefined;
  const onChange = useEventCallback((option: OptionType<unknown>) => {
    if (!config) return;
    const index = config.options.indexOf(option);
    const newConfig = cloneDeep(config);
    for (const opt of newConfig.options) {
      opt.selected = false;
    }
    newConfig.options[index].selected = true;
    props.updateField([...props.path], newConfig, props.schema, props.rootSchema);
  });
  const visibility = useVisibility(
    props.schema,
    props.parentConfig,
    props.modes,
    props.loadedEnvironmentVariables,
  );
  const badges = useBadges(props.schema, props.path, props.loadedEnvironmentVariables, props.restartPendingFor);
  const isDisabled = visibility === 'disabled';
  const isReadOnly = visibility === 'read-only';
  const size = useMemo(() => {
    const uiDefinition = props.schema['x-uiDefinition'] as SelectConfigurationUiDefinitionType;
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
          values={config ? [...config.groups, ...config.options] : []}
          serverControlled={props.serverControlled}
          onChange={onChange}
        />
      </div>
      <div className="mt-1 text-sm text-panel-text opacity-65">{description}</div>
    </div>
  );
}

export default SingleItemSelect;
