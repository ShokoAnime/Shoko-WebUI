import React from 'react';
import { mdiBlockHelper, mdiClose, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import cx from 'classnames';

import useEventCallback from '@/hooks/useEventCallback';

import type { TabType } from '@/components/TabPills';

type ListTabPillsProps = {
  tabs: TabType[];
  showAddButton: boolean;
  addItem: () => void;
  canAdd: boolean;
  showRemoveButton: boolean;
  removeItem: (index: number) => void;
  canRemove: boolean;
};

function ListTabPills(props: ListTabPillsProps): React.JSX.Element {
  const { addItem, canAdd, canRemove, removeItem, showAddButton, showRemoveButton, tabs } = props;
  return (
    <div className="flex gap-x-3 overflow-x-scroll">
      <nav
        aria-label="Tabs"
        className={cx(
          'isolate flex divide-x divide-panel-toggle-background-alt overflow-x-scroll rounded-lg shadow-sm',
          tabs.length === 0 && 'hidden',
        )}
      >
        {tabs.map((tab, tabIdx) => (
          <TabPill
            // eslint-disable-next-line react/no-array-index-key
            key={`tab-${tabIdx}`}
            tab={tab}
            tabCount={tabs.length}
            index={tabIdx}
            showRemoveButton={showRemoveButton}
            removeItem={removeItem}
            canRemove={canRemove}
          />
        ))}
      </nav>
      {!showAddButton && tabs.length === 0 && (
        <div className="group relative min-w-0 shrink-0 grow place-items-center overflow-hidden whitespace-nowrap rounded-lg bg-panel-background p-4 text-sm font-medium text-panel-toggle-text-alt focus:z-10">
          <Icon path={mdiBlockHelper} size={1} />
        </div>
      )}
      {showAddButton && (
        <button
          type="button"
          disabled={!canAdd}
          onClick={addItem}
          className={cx(
            'group relative min-w-0 shrink-0 flex place-items-center overflow-hidden whitespace-nowrap rounded-lg bg-panel-background p-4 text-sm font-medium text-panel-toggle-text-alt hover:bg-panel-toggle-background-hover focus:z-10',
            tabs.length > 0 && 'grow-0',
            tabs.length === 0 && 'grow',
          )}
        >
          <Icon path={mdiPlus} size={1} />
        </button>
      )}
    </div>
  );
}

type TabPillProps = {
  tab: TabType;
  tabCount: number;
  index: number;
  showRemoveButton: boolean;
  removeItem: (index: number) => void;
  canRemove: boolean;
};

function TabPill(props: TabPillProps): React.JSX.Element {
  const { canRemove, index: tabIdx, removeItem, showRemoveButton, tab, tabCount } = props;

  const isDisabled = tab.current || tabCount <= 1;

  const handleClick = useEventCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    tab.onClick();
  });

  const handleRemove = useEventCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    removeItem(tabIdx);
  });

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-current={tab.current ? 'page' : undefined}
      className={cx(
        'whitespace-nowrap flex group relative min-w-0 grow overflow-hidden shrink-0 px-4 py-4 text-center text-sm font-medium focus:z-10',
        tab.current
          ? 'bg-panel-toggle-background text-panel-toggle-text'
          : 'bg-panel-background hover:bg-panel-toggle-background-hover text-panel-toggle-text-alt',
        tabIdx === 0 ? 'rounded-l-lg' : '',
        tabIdx === tabCount - 1 ? 'rounded-r-lg' : '',
        isDisabled && 'pointer-events-none',
      )}
    >
      <span className="flex grow justify-center">{tab.name}</span>
      {showRemoveButton && (
        <button className="pointer-events-auto" type="button" disabled={!canRemove} onClick={handleRemove}>
          <Icon path={mdiClose} size={1} />
        </button>
      )}
    </button>
  );
}

export default ListTabPills;
