import React from 'react';
import cx from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { faDatabase } from '@fortawesome/free-solid-svg-icons';
import { faTachometerAlt } from '@fortawesome/free-solid-svg-icons';
import { faWrench } from '@fortawesome/free-solid-svg-icons';
import { faList } from '@fortawesome/free-solid-svg-icons';
import { faListAlt } from '@fortawesome/free-solid-svg-icons';

const iconMap = {
  dashboard: faTachometerAlt,
  collection: faDatabase,
  utilities: faWrench,
  actions: faList,
  log: faListAlt,
  settings: faCog,
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
            <div className="w-5 flex justify-center content-center"><FontAwesomeIcon icon={iconMap[icon]} /></div>
            <div className="pl-4 font-semibold">{label}</div>
        </div>
  );
}

export default MenuItem;
