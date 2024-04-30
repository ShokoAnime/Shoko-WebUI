import React from 'react';
import { NavLink } from 'react-router-dom';
import { mdiChevronRight } from '@mdi/js';
import { Icon } from '@mdi/react';

const TabButton = ({ id, name }: { id: string, name: string }) => (
  <NavLink to={`../release-management/${id}`} className={({ isActive }) => (isActive ? 'text-panel-text-primary' : '')}>
    {name}
  </NavLink>
);

const Title = () => (
  <div className="flex items-center gap-x-2 font-semibold">
    Release Management
    <Icon path={mdiChevronRight} size={1} />
    <TabButton id="multiples" name="Multiples" />
    {/* <div>|</div> */}
    {/* <TabButton id="duplicates" name="Duplicates" /> */}
  </div>
);

export default Title;
