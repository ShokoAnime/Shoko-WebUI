import React from 'react';
import cx from 'classnames';

type TabType = {
  id: string;
  name: React.ReactNode;
  onClick: () => void;
  active: boolean;
};

type Props = {
  tabs: TabType[];
};

const TabPills = ({ tabs }: Props) => (
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
            'flex-1 p-4 text-sm transition-colors',
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
