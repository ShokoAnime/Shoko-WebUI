import React from 'react';

import type { DisplayColorTheme } from '@/core/react-query/configuration/types';

type BadgeProps = {
  name: string;
  theme: DisplayColorTheme;
};

const themes: Record<DisplayColorTheme, string> = {
  default: 'text-panel-text border-panel-text',
  primary: 'text-panel-text-primary border-panel-text-primary',
  secondary: 'text-panel-text-secondary border-panel-text-secondary',
  important: 'text-panel-text-important border-panel-text-important',
  warning: 'text-panel-text-warning border-panel-text-warning',
  danger: 'text-panel-text-danger border-panel-text-danger',
};

function CustomBadge(props: BadgeProps): React.JSX.Element {
  return (
    <span className={`self-center rounded-full border px-1 py-0.5 text-2xs ${themes[props.theme]}`}>
      {props.name}
    </span>
  );
}

export default CustomBadge;
