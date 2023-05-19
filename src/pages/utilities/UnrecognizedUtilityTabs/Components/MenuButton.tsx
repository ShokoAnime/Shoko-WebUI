import React from 'react';
import cx from 'classnames';
import { Icon } from '@mdi/react';

import Button from '../../../../components/Input/Button';

const MenuButton = ({ onClick, icon, name, highlight = false }: { onClick: (...args: any) => void, icon: string, name: string, highlight?: boolean }) => (
  <Button onClick={onClick} className="flex items-center text-font-main gap-x-2">
    <Icon path={icon} size={0.8333} className={cx({ 'text-highlight-1': highlight })} />
    {name}
  </Button>
);

export default MenuButton;
