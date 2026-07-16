import React from 'react';
import { NavLink } from 'react-router';

const TabButton = ({ id, name }: { id: string, name: string }) => (
  <NavLink
    to={`../legacy-release-management/${id}`}
    className={(
      { isActive },
    ) => (isActive ? 'text-panel-text-primary' : 'hover:text-panel-text-primary transition-colors')}
  >
    {name}
  </NavLink>
);

const Title = () => (
  <div className="flex items-center gap-x-2 font-semibold">
    <TabButton id="DuplicateFiles" name="Duplicates" />
    <div>|</div>
    <TabButton id="MissingEpisodes" name="Missing Episodes" />
  </div>
);

export default Title;
