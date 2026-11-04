import type { ReactNode } from 'react';
import { NavLink } from 'react-router';
import cx from 'classnames';

type Props = {
  to: string;
  children: ReactNode;
  hasTrailingAction?: boolean;
};

const SettingsNavLink = ({ children, hasTrailingAction = false, to }: Props) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cx(
        'w-full rounded-lg py-2 text-center',
        hasTrailingAction ? 'relative px-10' : 'px-2',
        isActive
          ? 'bg-panel-menu-item-background text-panel-menu-item-text'
          : 'transition-colors hover:bg-panel-menu-item-background-hover',
      )}
  >
    {children}
  </NavLink>
);

export default SettingsNavLink;
