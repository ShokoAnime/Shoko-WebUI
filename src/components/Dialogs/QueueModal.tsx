import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  mdiAlertCircleOutline,
  mdiCheckboxMarkedCircleOutline,
  mdiChevronRight,
  mdiCircleOutline,
  mdiHelpCircleOutline,
  mdiLoading,
  mdiRun,
} from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { filter, map, reduce, throttle } from 'lodash';
import { useEventCallback } from 'usehooks-ts';

import Input from '@/components/Input/Input';
import ModalPanel from '@/components/Panels/ModalPanel';
import MenuButton from '@/components/Utilities/Unrecognized/MenuButton';
import { useGetQueueOperationMutation, useLazyGetQueueItemsQuery } from '@/core/rtkQuery/splitV3Api/queueApi';

import type { RootState } from '@/core/store';
import type { QueueItemType } from '@/core/types/api/queue';

const names = { hasher: 'Hasher', general: 'General', image: 'Images' };

const stateNames = { hasher: 'HasherQueueState', general: 'GeneralQueueState', image: 'ImageQueueState' } as const;
type Props = {
  show: boolean;
  onClose: () => void;
};

const TabButton = (
  { activeTab, id, name, setActiveTab }: {
    id: QueueName;
    name: string;
    activeTab: QueueName;
    setActiveTab(value: QueueName): void;
  },
) => (
  <div
    className={cx(['cursor-pointer', id === activeTab ? 'text-panel-primary' : undefined])}
    onClick={() => setActiveTab(id)}
  >
    {name}
  </div>
);

type QueueName = keyof typeof names;

const QueueModal = ({ onClose, show: showModal }: Props) => {
  const state = useSelector((root: RootState) => root.mainpage.queueStatus);
  const [activeTab, setActiveTab] = useState<QueueName>('hasher');
  const [pageSize, setPageSize] = useState(10);
  const [showAll, setShowAll] = useState(true);
  const [getQuery, query] = useLazyGetQueueItemsQuery();
  const [queueOperation] = useGetQueueOperationMutation();
  const [expectedTab, setExpectedTab] = useState<QueueName | null>(null);
  const lastActiveTab = useRef<QueueName | null>(null);

  const isLoading = expectedTab !== activeTab;
  const count = showModal ? state[stateNames[activeTab]].queueCount : 0;

  const { isAllPaused, isPaused } = useMemo(
    () => ({
      isPaused: state[stateNames[activeTab]].status === 'Paused' || state[stateNames[activeTab]].status === 'Pausing',
      isAllPaused: reduce(
        state,
        (allPaused, item) => allPaused && (item?.status === 'Pausing' || item?.status === 'Paused'),
        true,
      ),
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

  const throttled = useMemo(() =>
    throttle((props) => {
      getQuery(props).catch(console.error);
    }, 500), [getQuery]);

  const tabs = useMemo(() =>
    map(Object.keys(names) as Array<QueueName>, (key, index, { length }) => (
      index !== length - 1
        ? (
          <>
            <TabButton key={key} id={key} name={names[key]} activeTab={activeTab} setActiveTab={setActiveTab} />
            <div key={`${key}.1`}>|</div>
          </>
        )
        : <TabButton key={key} id={key} name={names[key]} activeTab={activeTab} setActiveTab={setActiveTab} />
    )), [activeTab]);

  const items = useMemo(() => {
    // Don't render items if the modal is not shown.
    if (!showModal) {
      return [];
    }

    if (expectedTab !== activeTab) {
      if (query.isUninitialized || query.isFetching) {
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
        <div className="grow">
          {item.Name}
        </div>
        <div
          className={cx([
            'px-4',
            item.IsRunning ? 'text-panel-important' : undefined,
            item.IsDisabled ? 'text-panel-warning' : undefined,
          ])}
        >
          {item.IsRunning && <Icon path={mdiRun} size={1} />}
          {!item.IsRunning && <Icon path={item.IsDisabled ? mdiAlertCircleOutline : mdiHelpCircleOutline} size={1} />}
        </div>
      </div>
    ));
    if (currentCommand != null) {
      itemArray.unshift(
        <div className="mt-2 flex gap-x-3" key={`item-${currentCommand.ID}`}>
          <div className="grow">
            {currentCommand.Name}
          </div>
          <div className={cx(['px-4', currentCommand.IsRunning ? 'text-panel-important' : undefined])}>
            <Icon path={currentCommand.IsRunning ? mdiRun : mdiHelpCircleOutline} size={1} />
          </div>
        </div>,
      );
    }
    return itemArray;
  }, [showModal, activeTab, query, pageSize, currentCommand, expectedTab]);

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
      className="w-[56.875rem] flex-col gap-y-8 p-8 drop-shadow-lg"
    >
      <div className="flex items-center gap-x-0.5 font-semibold">
        Queue
        <Icon path={mdiChevronRight} size={1} />
        {tabs}
        <div className="flex grow" />
        <div className="flex gap-x-1">
          <div className="text-panel-important">{count < 0 ? '-' : count}</div>
          &nbsp;
          {names[activeTab]}
          &nbsp;Entries
        </div>
      </div>
      <div className="flex gap-x-3">
        <div className="flex grow gap-x-2 rounded-md border border-panel-border bg-panel-background-toolbar px-4 py-3">
          <MenuButton
            highlight
            onClick={handleShowDisabledToggle}
            icon={showAll ? mdiCheckboxMarkedCircleOutline : mdiCircleOutline}
            name="Show Disabled Queue Items"
          />
          <MenuButton
            highlight
            onClick={handleToggleAllQueues}
            icon={isAllPaused ? mdiCheckboxMarkedCircleOutline : mdiCircleOutline}
            name="Pause All Queues"
          />
          <MenuButton
            highlight
            onClick={handleToggleQueue}
            icon={isPaused ? mdiCheckboxMarkedCircleOutline : mdiCircleOutline}
            name={`Pause ${names[activeTab]} Queue`}
          />
        </div>
        <Input
          type="number"
          id="pageSize"
          value={pageSize}
          onChange={handlePageSizeChange}
          inputClassName="px-4 py-3 max-w-[4rem] text-center"
        />
      </div>
      <div className="flex flex-row">
        <div className="mt-2 w-full rounded-md border border-panel-border bg-panel-background-alt p-4 capitalize">
          <div className="flex h-64 flex-col overflow-y-auto bg-panel-background-alt">
            <div className="mt-0 flex gap-x-3">
              <div className="grow">
                <strong>Task</strong>
              </div>
              <div className="px-1">
                <strong>Status</strong>
              </div>
            </div>
            {items}
            {isLoading && (
              <div className="flex grow items-center justify-center">
                <Icon path={mdiLoading} spin size={3} />
              </div>
            )}
            {!isLoading && items.length === 0 && (
              <div className="flex grow items-center justify-center">
                <p>
                  {names[activeTab]}
                  &nbsp;Queue Is Empty.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModalPanel>
  );
};

export default QueueModal;
