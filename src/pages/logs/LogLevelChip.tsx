import cx from 'classnames';

import type { LogLevelType } from '@/core/react-query/logging/types';

const logLevelStyles: Record<LogLevelType, string> = {
  Trace: 'bg-panel-text/25 text-panel-text/90',
  Debug: 'bg-panel-text-other/15 text-panel-text-other',
  Information: 'bg-panel-text-important/15 text-panel-text-important',
  Warning: 'bg-panel-text-warning/15 text-panel-text-warning',
  Error: 'bg-panel-text-danger/20 text-panel-text-danger',
  Critical: 'bg-panel-text-danger text-button-danger-text',
  None: 'bg-panel-text/25 text-panel-text/90',
};

const logLevelHoverStyles: Record<LogLevelType, string> = {
  Trace: 'hover:bg-panel-text/25 hover:text-panel-text/90',
  Debug: 'hover:bg-panel-text-other/15 hover:text-panel-text-other',
  Information: 'hover:bg-panel-text-important/15 hover:text-panel-text-important',
  Warning: 'hover:bg-panel-text-warning/15 hover:text-panel-text-warning',
  Error: 'hover:bg-panel-text-danger/20 hover:text-panel-text-danger',
  Critical: 'hover:bg-panel-text-danger hover:text-button-danger-text',
  None: 'hover:bg-panel-text/25 hover:text-panel-text/90',
};

type Props = {
  level: LogLevelType;
  active?: boolean;
};

const LogLevelChip = ({ active = true, level }: Props) => (
  <div
    className={cx(
      'rounded-md px-2 py-0.5 text-xs transition-colors',
      active
        ? logLevelStyles[level]
        : cx(
          'bg-panel-input/50 text-panel-text/85 ring-1 ring-panel-text/25 ring-inset hover:ring-0',
          logLevelHoverStyles[level],
        ),
    )}
  >
    {level}
  </div>
);

export default LogLevelChip;
