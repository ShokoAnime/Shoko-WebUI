import React, { useMemo } from 'react';
import { mdiSprout, mdiSproutOutline } from '@mdi/js';
import Icon from '@mdi/react';
import cx from 'classnames';

type EnvironmentVariableIconProps = {
  envVar: string;
  envVarOverridable: boolean;
  loadedEnvironmentVariables: string[];
};

function EnvironmentVariableBadge(props: EnvironmentVariableIconProps): React.JSX.Element {
  const isLoaded = useMemo(() => props.loadedEnvironmentVariables.includes(props.envVar), [
    props.envVar,
    props.loadedEnvironmentVariables,
  ]);
  const canSet = useMemo(() => !isLoaded || props.envVarOverridable, [isLoaded, props.envVarOverridable]);
  const tooltip = `${props.envVar}${isLoaded ? ' (Loaded)' : ''}${isLoaded && !canSet ? ' (Locked)' : ''}`;
  return (
    <span
      data-tooltip-id="tooltip"
      data-tooltip-content={tooltip}
      className={cx(
        'self-center cursor-help',
        isLoaded && !canSet && 'text-panel-icon-danger',
        isLoaded && canSet && 'text-panel-icon-warning',
        !isLoaded && 'text-panel-icon-important',
      )}
    >
      <Icon path={isLoaded ? mdiSproutOutline : mdiSprout} size={0.75} />
    </span>
  );
}

export default EnvironmentVariableBadge;
