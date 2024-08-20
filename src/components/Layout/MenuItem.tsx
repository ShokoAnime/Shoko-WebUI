import React from 'react';
import { Icon } from '@mdi/react';
import cx from 'classnames';

export type MenuItemProps = {
  id: string;
  text: string;
  icon: string;
  onClick: () => void;
  isHighlighted: boolean;
};

const MenuItem = React.memo(({ icon, id, isHighlighted, onClick, text }: MenuItemProps) => (
  <div
    key={id}
    className={cx(
      'flex items-center gap-x-3 cursor-pointer hover:text-topnav-text-primary',
      isHighlighted && 'text-topnav-text-primary',
    )}
    onClick={onClick}
  >
    <Icon path={icon} size={1} />
    {text}
  </div>
));

export default MenuItem;
