import React from 'react';
import cx from 'classnames';
import { Icon } from '@mdi/react';

import { mdiCogOutline, mdiTabletDashboard, mdiLayersTripleOutline, mdiTools, mdiFormatListBulletedSquare, mdiTextBoxOutline } from '@mdi/js';

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
  onClick: (event: any) => void;
};

function MenuItem(props: MenuItemProps) {
  const {
    icon, label, className, onClick,
  } = props;

  return (
    <div className={cx(className, 'text-lg flex items-center')} onClick={onClick}>
      <div className="w-5 flex justify-center content-center">
        <Icon path={iconMap[icon]} size={1} horizontal vertical rotate={180} />
      </div>
      <div className="pl-4 font-semibold">{label}</div>
    </div>
  );
}

export default MenuItem;
