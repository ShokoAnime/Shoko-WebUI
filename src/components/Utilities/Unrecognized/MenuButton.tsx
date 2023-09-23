import React from 'react';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import Button from '@/components/Input/Button';

const MenuButton = (
  { disabled, highlight = false, icon, name, onClick }: {
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    icon: string;
    name: string;
    highlight?: boolean;
    disabled?: boolean;
  },
) => (
  <Button onClick={onClick} className="flex items-center gap-x-2 text-panel-text" disabled={disabled}>
    <Icon path={icon} size={0.8333} className={cx({ 'text-panel-primary': highlight })} />
    {name}
  </Button>
);

export default MenuButton;
