import React from 'react';
import cx from 'classnames';

export type TabType = {
  name: React.ReactNode;
  onClick: () => void;
  current: boolean;
};

export type TabPillsProps = {
  tabs: TabType[];
};

const TabPills = (props: TabPillsProps) => {
  const { tabs } = props;
  return (
    <nav
      aria-label="Tabs"
      className="isolate flex divide-x divide-panel-toggle-background-alt overflow-x-auto rounded-lg shadow-sm"
    >
      {tabs.map((tab, tabIdx) => (
        <button
          // eslint-disable-next-line react/no-array-index-key
          key={`tab-${tabIdx}`}
          type="button"
          onClick={tab.onClick}
          disabled={tab.current || tabs.length <= 1}
          aria-current={tab.current ? 'page' : undefined}
          className={cx(
            'whitespace-nowrap group relative min-w-0 grow overflow-hidden shrink-0 px-4 py-4 text-center text-sm font-medium focus:z-10',
            tab.current
              ? '!bg-panel-toggle-background text-panel-toggle-text'
              : 'bg-panel-background hover:bg-panel-toggle-background-hover text-panel-toggle-text-alt',
            tabIdx === 0 ? 'rounded-l-lg' : '',
            tabIdx === tabs.length - 1 ? 'rounded-r-lg' : '',
          )}
        >
          <span>{tab.name}</span>
        </button>
      ))}
    </nav>
  );
};

export default TabPills;
