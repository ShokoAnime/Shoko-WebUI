import { Fragment } from 'react';
import { NavLink } from 'react-router';
import { mdiChevronRight } from '@mdi/js';
import { Icon } from '@mdi/react';

type Tab = { id: string, name: string };

type Props = {
  basePath: string;
  tabs: Tab[];
  title: string;
};

const TabButton = ({ basePath, tab }: { basePath: string, tab: Tab }) => (
  <NavLink
    to={`${basePath}/${tab.id}`}
    className={(
      { isActive },
    ) => (isActive ? 'text-panel-text-primary' : 'hover:text-panel-text-primary transition-colors')}
  >
    {tab.name}
  </NavLink>
);

const TabTitle = ({ basePath, tabs, title }: Props) => (
  <div className="flex items-center gap-x-2 font-semibold">
    {title}
    <Icon path={mdiChevronRight} size={1} />
    {tabs.map((tab, index) => (
      <Fragment key={tab.id}>
        <TabButton basePath={basePath} tab={tab} />
        {index < tabs.length - 1 && <div>|</div>}
      </Fragment>
    ))}
  </div>
);

export default TabTitle;
