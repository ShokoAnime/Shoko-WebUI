import React from 'react';
import { NavLink } from 'react-router';
import { mdiChevronRight } from '@mdi/js';
import { Icon } from '@mdi/react';

const TabButton = ({ id, name }: { id: string, name: string }) => (
  <NavLink
    to={`../unrecognized/${id}`}
    className={(
      { isActive },
    ) => (isActive ? 'text-panel-text-primary' : 'hover:text-panel-text-primary transition-colors')}
  >
    {name}
  </NavLink>
);

const Title = () => (
  <div className="flex items-center gap-x-2 font-semibold">
    Unrecognized Files
    <Icon path={mdiChevronRight} size={1} />
    <TabButton id="files" name="Unrecognized" />
    <div>|</div>
    <TabButton id="manually-linked-files" name="Manually Linked" />
    <div>|</div>
    <TabButton id="ignored-files" name="Ignored" />
  </div>
);

export default Title;
