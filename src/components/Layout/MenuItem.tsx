import React from 'react';
import {
  mdiCogOutline,
  mdiFormatListBulletedSquare,
  mdiLayersTripleOutline,
  mdiTabletDashboard,
  mdiTextBoxOutline,
  mdiTools,
} from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

const iconMap = {
  dashboard: mdiTabletDashboard,
  collection: mdiLayersTripleOutline,
  utilities: mdiTools,
  actions: mdiFormatListBulletedSquare,
  log: mdiTextBoxOutline,
  settings: mdiCogOutline,
};

enum IconType {
  dashboard = 'dashboard',
  collection = 'collection',
  utilities = 'utilities',
  actions = 'actions',
  log = 'log',
  settings = 'settings',
}

export type MenuItemProps = {
  icon: IconType;
  label: string;
  className?: string;
  onClick: React.MouseEventHandler<HTMLDivElement>;
};

function MenuItem(props: MenuItemProps) {
  const {
    className,
    icon,
    label,
    onClick,
  } = props;

  return (
    <div className={cx(className, 'text-lg flex items-center')} onClick={onClick}>
      <div className="flex w-5 content-center justify-center">
        <Icon path={iconMap[icon]} size={1} horizontal vertical rotate={180} />
      </div>
      <div className="pl-4 font-semibold">{label}</div>
    </div>
  );
}

export default MenuItem;
