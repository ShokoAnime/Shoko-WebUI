import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '@mdi/react';
import cx from 'classnames';

type LinkMenuItemProps = {
  icon: string;
  onClick: () => void;
  path: string;
  text: string;
};
export const LinkMenuItem = React.memo((props: LinkMenuItemProps) => {
  const {
    icon,
    onClick,
    path,
    text,
  } = props;
  return (
    <NavLink
      to={path}
      key={path.split('/')
        .pop()}
      className={({ isActive }) => cx('flex items-center gap-x-3', isActive && 'text-topnav-text-primary')}
      onClick={onClick}
    >
      <Icon path={icon} size={1} />
      {text}
    </NavLink>
  );
});
