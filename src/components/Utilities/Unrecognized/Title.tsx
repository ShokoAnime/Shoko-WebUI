import React from 'react';
import { Icon } from '@mdi/react';
import { mdiChevronRight } from '@mdi/js';
import { NavLink } from 'react-router-dom';

const TabButton = ({ id, name }: { id: string; name: string }) => (
  <NavLink to={`../${id}`} className={({ isActive }) => (isActive ? 'text-highlight-1' : '')}>
    {name}
  </NavLink>
);

const Title = () => (
  <div className="flex items-center font-semibold gap-x-2">
    Unrecognized Files
    <Icon path={mdiChevronRight} size={1} />
    <TabButton id="files" name="Unrecognized" />
    <div>|</div>
    <TabButton id="manually-linked-files" name="Manually Linked" />
    <div>|</div>
    <TabButton id="ignored-files" name="Ignored Files" />
  </div>
);

export default Title;
