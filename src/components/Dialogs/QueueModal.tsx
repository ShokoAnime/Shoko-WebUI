import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import cx from 'classnames';
import { filter, map, reduce, throttle } from 'lodash';
import { Icon } from '@mdi/react';
import { mdiAlertCircleOutline, mdiCheckboxMarkedCircleOutline, mdiChevronRight, mdiCircleOutline, mdiHelpCircleOutline, mdiLoading, mdiRun } from '@mdi/js';
import { useEventCallback } from 'usehooks-ts';

import ModalPanel from '@/components/Panels/ModalPanel';
import { useGetQueueOperationMutation, useLazyGetQueueItemsQuery } from '@/core/rtkQuery/splitV3Api/queueApi';
import { RootState } from '@/core/store';
import { QueueItemType } from '@/core/types/api/queue';
import Input from '../Input/Input';
import MenuButton from '../Utilities/Unrecognized/MenuButton';

const names = { hasher: 'Hasher', general: 'General', image: 'Images' };

const stateNames = { hasher: 'HasherQueueState', general: 'GeneralQueueState', image: 'ImageQueueState' } as const;
type Props = {
  show: boolean;
  onClose: () => void;
};

const TabButton = ({ id, name, activeTab, setActiveTab }: { id: keyof typeof names; name: string; activeTab: keyof typeof names; setActiveTab(value: keyof typeof names): void; }) => (
  <div className={cx(['cursor-pointer', id === activeTab ? 'text-panel-primary' : undefined])} onClick={() => setActiveTab(id)}>
    {name}
  </div>
);

function QueueModal({ show: showModal, onClose }: Props) {
  const state = useSelector((root: RootState) => root.mainpage.queueStatus);
  const [activeTab, setActiveTab] = useState<keyof typeof names>('hasher');
  const [pageSize, setPageSize] = useState(10);
  const [showAll, setShowAll] = useState(true);
  const [getQuery, query] = useLazyGetQueueItemsQuery();
  const [queueOperation] = useGetQueueOperationMutation();
  const [expectedTab, setExpectedTab] = useState<keyof typeof names | null>(null);
  const lastActiveTab = useRef<keyof typeof names | null>(null);

  const isLoading = expectedTab !== activeTab;
  const count = showModal ? state[stateNames[activeTab]].queueCount : 0;

  const { isPaused, isAllPaused } = useMemo(
    () => ({
      isPaused: state[stateNames[activeTab]].status === 'Paused' || state[stateNames[activeTab]].status === 'Pausing',
      isAllPaused: reduce(state, (allPaused, item) => allPaused && (item?.status === 'Pausing' || item?.status === 'Paused'), true),
    }),
    [state, activeTab],
  );

  const currentCommand = useMemo(() => {
    if (!showModal) {
      return null;
    }
    const Name = state[stateNames[activeTab]].description;
    if (Name === 'Idle' || Name === 'Paused') {
      return null;
    }
    return {
      ID: state[stateNames[activeTab]].currentCommandID || 0,
      Name,
      Type: 'Active',
      IsDisabled: false,
      IsRunning: true,
    } as QueueItemType;
  }, [showModal, state, activeTab]);

  const throttled = useMemo(() => throttle((props) => { getQuery(props).catch(console.error); }, 500), [getQuery]);

  const tabs = useMemo(() => reduce(Object.keys(names) as Array<keyof typeof names>, (array, key, index, { length }) => {
    array.push(<TabButton key={key} id={key} name={names[key]} activeTab={activeTab} setActiveTab={setActiveTab} />);
    if (index !== length - 1) {
      array.push(<div key={`${key}.1`}>|</div>);
    }
    return array;
  }, new Array<React.ReactNode>()), [activeTab]);

  const title = useMemo(() => (
    <div className="flex items-center font-semibold gap-x-0.5">
      Queue
      <Icon path={mdiChevronRight} size={1} />
      {tabs}
      <div className="flex flex-grow" />
      <div className="flex gap-x-1"><div className="text-panel-important">{count < 0 ? '-' : count}</div> {names[activeTab]} Entries</div>
    </div>
  ), [tabs, activeTab, count]);

  const items = useMemo(() => {
    // Don't render items if the modal is not shown or if we have a running
    // command and the page size is 1.
    if (!showModal || (pageSize === 1 && currentCommand != null)) {
      return [];
    }

    if (expectedTab !== activeTab) {
      if (query.isUninitialized || query.isLoading || query.isFetching) {
        return [];
      }
      setExpectedTab(activeTab);
    }

    let array = query.data?.List ?? [];
    if (currentCommand != null) {
      array = filter(array, item => item.ID !== currentCommand.ID);
      // Remove the last item if the above filtering did nothing.
      if (pageSize !== 0 && array.length >= pageSize) {
        array = array.slice(0, -1);
      }
    }

    const itemArray = map(array, item => (
      <div className="mt-2 flex gap-x-3" key={`item-${item.ID}`}>
        <div className="flex-grow">
          {item.Name}
        </div>
        <div className={cx(['px-4', item.IsRunning ? 'text-panel-important' : undefined, item.IsDisabled ? 'text-panel-warning' : undefined])}>
          {/* eslint-disable-next-line no-nested-ternary */}
          <Icon path={item.IsRunning ? mdiRun : item.IsDisabled ? mdiAlertCircleOutline : mdiHelpCircleOutline} size={1} />
        </div>
      </div>
    ));
    if (currentCommand != null) {
      itemArray.unshift(
        <div className="mt-2 flex gap-x-3" key={`item-${currentCommand.ID}`}>
          <div className="flex-grow">
            {currentCommand.Name}
          </div>
          <div className={cx(['px-4', currentCommand.IsRunning ? 'text-panel-important' : undefined])}>
            <Icon path={currentCommand.IsRunning ? mdiRun : mdiHelpCircleOutline} size={1} />
          </div>
        </div>,
      );
    }
    return itemArray;
  }, [showModal, activeTab, query.data, pageSize, currentCommand, expectedTab, query.isUninitialized, query.isLoading, query.isFetching]);

  const handlePageSizeChange = useEventCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    let value = parseInt(e.target.value, 10);
    if (Number.isNaN(value)) {
      return;
    }

    if (!Number.isInteger(value)) {
      value = Math.floor(value);
    }

    // eslint-disable-next-line no-nested-ternary
    value = value > 100 ? 100 : value < 0 ? 0 : value;

    setPageSize(value);
  });

  const handleShowDisabledToggle = useEventCallback(() => {
    setShowAll(!showAll);
  });

  const handleToggleAllQueues = useEventCallback(async () => {
    await queueOperation({ operation: isAllPaused ? 'StartAll' : 'StopAll' });
  });

  const handleToggleQueue = useEventCallback(async () => {
    await queueOperation({ operation: isPaused ? 'Start' : 'Stop', queue: activeTab });
  });

  // We're intentionally not letting RTK invalidate any tags for automagic query
  // updates, since if we did then it would fetch in the background when the
  // modal is not in view, since it's technically always mounted, just not
  // shown.
  useLayoutEffect(() => {
    if (showModal) {
      if (activeTab !== lastActiveTab.current) {
        setExpectedTab(null);
        lastActiveTab.current = activeTab;
        getQuery({ queueName: activeTab, showAll, pageSize }).catch(() => undefined);
      } else {
        throttled({ queueName: activeTab, showAll, pageSize });
      }
    // Reset the tab after the modal is closed.
    } else if (activeTab !== 'hasher') {
      const id = setTimeout(() => {
        setExpectedTab(null);
        setActiveTab('hasher');
        lastActiveTab.current = null;
      }, 1000);
      return () => clearTimeout(id);
    }
    return () => undefined;
  }, [showModal, activeTab, showAll, pageSize, throttled, getQuery, count]);

  return (
    <ModalPanel
      show={showModal}
      onRequestClose={onClose}
      className="p-8 flex-col drop-shadow-lg gap-y-8 w-[56.875rem]"
    >
      {title}
      <div className="flex align-items-start gap-x-3 align-self-stretch">
        <div className="flex flex-grow py-3 px-4 align-items-center gap-x-2 align-self-stretch border border-panel-border rounded-md bg-panel-background-toolbar">
          <MenuButton highlight onClick={handleShowDisabledToggle} icon={showAll ? mdiCheckboxMarkedCircleOutline : mdiCircleOutline} name="Show Disabled Queue Items" />
          <MenuButton highlight onClick={handleToggleAllQueues} icon={isAllPaused ? mdiCheckboxMarkedCircleOutline : mdiCircleOutline} name="Pause All Queues" />
          <MenuButton highlight onClick={handleToggleQueue} icon={isPaused ? mdiCheckboxMarkedCircleOutline : mdiCircleOutline} name={`Pause ${names[activeTab]} Queue`} />
        </div>
        <Input type="number" id="pageSize" value={pageSize} onChange={handlePageSizeChange} inputClassName="px-4 py-3 max-w-[4rem] text-center" />
      </div>
      <div className="flex flex-row">
        <div className="bg-panel-background-alt border border-panel-border mt-2 p-4 capitalize w-full rounded-md">
          <div className="flex flex-col bg-panel-background-alt overflow-y-auto h-64">
            <div className="mt-0 flex gap-x-3">
              <div className="flex-grow">
                <strong>Task</strong>
              </div>
              <div className="px-1">
                <strong>Status</strong>
              </div>
            </div>
            {items}
            {isLoading ? (
              <div className="flex flex-grow items-center justify-center">
                <Icon path={mdiLoading} spin size={3} />
              </div>
            ) : null}
            {!isLoading && items.length === 0 ? (
              <div className="flex flex-grow items-center justify-center">
                <p>{names[activeTab]} Queue Is Empty.</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </ModalPanel>
  );
}

export default QueueModal;
