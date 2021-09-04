import React from 'react';
import MenuItem from './MenuItem';

import type { MenuItemProps } from './MenuItem';

type Props = {
  items: MenuItemProps[];
};

function SideMenu(props: Props) {
  const { items } = props;

  return (
        <div className="grid grid-cols-1 gap-4">
            {items.map(item => <MenuItem {...item} />)}
        </div>
  );
}

export default SideMenu;
