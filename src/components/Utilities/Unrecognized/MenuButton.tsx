import React from 'react';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import Button from '@/components/Input/Button';

const MenuButton = React.memo((
  { disabled, highlight = false, icon, name, onClick }: {
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    icon: string;
    name: string;
    highlight?: boolean;
    disabled?: boolean;
  },
) => (
  <Button
    onClick={onClick}
    className="flex items-center gap-x-2 !text-base !font-normal text-panel-text"
    disabled={disabled}
  >
    <Icon path={icon} size={1} className={cx({ 'text-panel-text-primary': highlight })} />
    {name}
  </Button>
));

export default MenuButton;
