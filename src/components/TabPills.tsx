import React from 'react';
import cx from 'classnames';

export type TabType = {
  id: string;
  name: React.ReactNode;
  onClick: () => void;
  active: boolean;
};

export type TabPillProps = {
  tabs: TabType[];
};

const TabPills = ({ tabs }: TabPillProps) => (
  <div className="isolate flex divide-x divide-panel-toggle-background-alt overflow-x-auto rounded-lg shadow-sm">
    {tabs.map((tab) => {
      const { active, id, name, onClick } = tab;
      return (
        <button
          key={id}
          type="button"
          onClick={onClick}
          disabled={active || tabs.length <= 1}
          className={cx(
            'group relative min-w-0 flex-1 shrink-0 grow overflow-hidden p-4 text-sm whitespace-nowrap transition-colors',
            active
              ? 'bg-panel-toggle-background! text-panel-toggle-text'
              : 'bg-panel-background text-panel-toggle-text-alt hover:bg-panel-toggle-background-hover',
          )}
        >
          {name}
        </button>
      );
    })}
  </div>
);

export default TabPills;
