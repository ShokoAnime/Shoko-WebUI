import React, { useMemo } from 'react';
import { mdiRestart, mdiRestartAlert } from '@mdi/js';
import Icon from '@mdi/react';
import cx from 'classnames';

import { pathToString } from '@/core/schema';

type NeedsRestartBadgeProps = {
  path: (string | number)[];
  restartPendingFor: string[];
};

function NeedsRestartBadge(props: NeedsRestartBadgeProps): React.JSX.Element {
  const isRestartPending = useMemo(() => props.restartPendingFor.includes(pathToString(props.path)), [
    props.path,
    props.restartPendingFor,
  ]);
  const tooltip = isRestartPending ? 'Restart pending for changes to take effect' : 'Requires restart to take effect';

  return (
    <span
      data-tooltip-id="tooltip"
      data-tooltip-content={tooltip}
      className={cx(
        'self-center cursor-help',
        isRestartPending && 'text-panel-icon-danger',
        !isRestartPending && 'text-panel-icon-important',
      )}
    >
      <Icon path={isRestartPending ? mdiRestartAlert : mdiRestart} size={0.75} />
    </span>
  );
}

export default NeedsRestartBadge;
