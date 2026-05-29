import React from 'react';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import Button from '@/components/Input/Button';

const MenuButton = (
  { disabled, highlightType, icon, name, onClick }: {
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    icon: string;
    name: string;
    highlightType?: 'primary' | 'danger';
    disabled?: boolean;
  },
) => (
  <Button
    onClick={onClick}
    className="flex items-center gap-x-2 text-base! font-normal! text-panel-text"
    disabled={disabled}
  >
    <Icon
      path={icon}
      size={1}
      className={cx({
        'text-panel-text-primary': highlightType === 'primary',
        'text-panel-text-danger': highlightType === 'danger',
      })}
    />
    {name}
  </Button>
);

export default MenuButton;
