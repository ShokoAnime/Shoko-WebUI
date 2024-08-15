import React from 'react';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import useEventCallback from '@/hooks/useEventCallback';

export type MenuItemProps = {
  id: string;
  text: string;
  icon: string;
  onClick: () => void;
  isHighlighted: boolean;
};

const MenuItem = React.memo(({ icon, id, isHighlighted, onClick, text }: MenuItemProps) => {
  const handleClick = useEventCallback((event: React.MouseEvent) => {
    event.preventDefault();
    onClick();
  });

  return (
    <div
      key={id}
      className={cx('flex items-center gap-x-3 cursor-pointer', isHighlighted && 'text-topnav-text-primary')}
      onClick={handleClick}
    >
      <Icon path={icon} size={1} />
      {text}
    </div>
  );
});

export default MenuItem;
