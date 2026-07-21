import React from 'react';
import { NavLink } from 'react-router';
import { mdiChevronRight } from '@mdi/js';
import { Icon } from '@mdi/react';

const TabButton = ({ id, name }: { id: string, name: string }) => (
  <NavLink
    to={`../duplicate-files/${id}`}
    className={(
      { isActive },
    ) => (isActive ? 'text-panel-text-primary' : 'hover:text-panel-text-primary transition-colors')}
  >
    {name}
  </NavLink>
);

const Title = () => (
  <div className="flex items-center gap-x-2 font-semibold">
    Duplicate Files
    <Icon path={mdiChevronRight} size={1} />
    <TabButton id="linked" name="Linked" />
    <div>|</div>
    <TabButton id="unrecognized" name="Unrecognized" />
  </div>
);

export default Title;
