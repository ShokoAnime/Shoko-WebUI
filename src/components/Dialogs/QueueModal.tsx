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

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import ModalPanel from '@/components/Panels/ModalPanel';
import MenuButton from '@/components/Utilities/Unrecognized/MenuButton';
import { useQueueOperationMutation } from '@/core/react-query/queue/mutations';
import { useQueueItemsQuery } from '@/core/react-query/queue/queries';

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
    className={cx(['cursor-pointer', id === activeTab ? 'text-panel-text-primary' : undefined])}
    onClick={() => setActiveTab(id)}
  >
    {name}
  </div>
);

type QueueName = keyof typeof names;

const Title = ({ activeTab, count, tabs }: { activeTab: string, count: number, tabs: React.ReactNode[] }) => (
  <div className="flex items-center gap-x-0.5 font-semibold">
    Queue
    <Icon path={mdiChevronRight} size={1} />
    <div className="flex gap-x-2">
      {tabs}
    </div>
    <div className="flex grow" />
    <div className="flex gap-x-1">
      <div className="text-panel-text-important">{count < 0 ? '-' : count}</div>
      &nbsp;
      {names[activeTab]}
      &nbsp;Entries
    </div>
  </div>
);

const QueueModal = ({ onClose, show: showModal }: Props) => {
  const state = useSelector((root: RootState) => root.mainpage.queueStatus);
  const [activeTab, setActiveTab] = useState<QueueName>('hasher');
  const [pageSize, setPageSize] = useState(10);
  const [showAll, setShowAll] = useState(true);
  const queueQuery = useQueueItemsQuery(activeTab, { showAll, pageSize }, false);
  const { mutate: queueOperation } = useQueueOperationMutation();
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
    const current = state[stateNames[activeTab]];
    const Description = current.description;
    if (Description === 'Idle' || Description === 'Paused') {
      return null;
    }
    return {
      ID: current.currentCommandID || 0,
      Name: 'UnknownCommandRequest_0',
      Description,
      Type: 'ActiveCommand',
      IsDisabled: false,
      IsRunning: true,
    } as QueueItemType;
  }, [showModal, state, activeTab]);

  const throttledQueueQuery = useMemo(() =>
    throttle(() => {
      queueQuery.refetch().catch(console.error);
    }, 500), [queueQuery]);

  const tabs = useMemo(() =>
    map(Object.keys(names) as QueueName[], (key, index, { length }) => (
      index !== length - 1
        ? (
          <React.Fragment key={key}>
            <TabButton id={key} name={names[key]} activeTab={activeTab} setActiveTab={setActiveTab} />
            |
          </React.Fragment>
        )
        : <TabButton key={key} id={key} name={names[key]} activeTab={activeTab} setActiveTab={setActiveTab} />
    )), [activeTab]);

  const items = useMemo(() => {
    // Don't render items if the modal is not shown.
    if (!showModal) {
      return [];
    }

    if (expectedTab !== activeTab) {
      if (!queueQuery.isSuccess) {
        return [];
      }
      setExpectedTab(activeTab);
    }

    let array = queueQuery.data?.List ?? [];
    if (currentCommand != null) {
      array = filter(array, item => item.ID !== currentCommand.ID);
      // Remove the last item if the above filtering did nothing.
      if (pageSize !== 0 && array.length >= pageSize) {
        array = array.slice(0, -1);
      }
    }

    const itemArray = map(array, item => (
      <div className="mt-2 flex gap-x-3" key={`item-${item.ID}`}>
        <div className="grow break-all">
          {item.Description}
        </div>
        <div
          className={cx([
            'px-4',
            item.IsRunning ? 'text-panel-text-important' : undefined,
            item.IsDisabled ? 'text-panel-text-warning' : undefined,
          ])}
        >
          {item.IsRunning && <Icon path={mdiRun} size={1} />}
          {!item.IsRunning && <Icon path={item.IsDisabled ? mdiAlertCircleOutline : mdiHelpCircleOutline} size={1} />}
        </div>
      </div>
    ));
    if (currentCommand != null) {
      itemArray.unshift(
        <div className="mt-2 flex gap-x-3" key={`item-${currentCommand.ID}-running`}>
          <div className="grow break-all">
            {currentCommand.Description}
          </div>
          <div className={cx(['px-4', currentCommand.IsRunning ? 'text-panel-text-important' : undefined])}>
            <Icon path={currentCommand.IsRunning ? mdiRun : mdiHelpCircleOutline} size={1} />
          </div>
        </div>,
      );
    }
    return itemArray;
  }, [showModal, activeTab, queueQuery.data, queueQuery.isSuccess, pageSize, currentCommand, expectedTab]);

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

  const handleToggleAllQueues = useEventCallback(
    () => queueOperation({ operation: isAllPaused ? 'StartAll' : 'StopAll' }),
  );

  const handleToggleQueue = useEventCallback(
    () => queueOperation({ operation: isPaused ? 'Start' : 'Stop', queue: activeTab }),
  );

  const handleClearQueue = useEventCallback(
    () => queueOperation({ operation: 'Clear', queue: activeTab }),
  );

  // We're intentionally not letting RTK invalidate any tags for automagic query
  // updates, since if we did then it would fetch in the background when the
  // modal is not in view, since it's technically always mounted, just not
  // shown.
  useLayoutEffect(() => {
    if (showModal) {
      if (activeTab !== lastActiveTab.current) {
        setExpectedTab(null);
        lastActiveTab.current = activeTab;
        queueQuery.refetch().catch(() => undefined);
      } else {
        throttledQueueQuery();
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
  }, [showModal, activeTab, showAll, pageSize, throttledQueueQuery, queueQuery, count]);

  return (
    <ModalPanel
      show={showModal}
      onRequestClose={onClose}
      size="lg"
      title={<Title activeTab={activeTab} count={count} tabs={tabs} />}
    >
      <div className="flex gap-x-3">
        <div className="flex grow gap-x-2 rounded-md border border-panel-border bg-panel-background-alt px-4 py-3">
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
        <Button
          buttonType="secondary"
          className="flex items-center gap-x-2.5 px-4 py-3 font-semibold"
          onClick={handleClearQueue}
        >
          Clear Queue
        </Button>
      </div>
      <div className="flex flex-col">
        <div className="flex w-full rounded-md border border-panel-border bg-panel-input p-4 capitalize">
          <div className="grow">
            <strong>Task</strong>
          </div>
          <div className="px-1">
            <strong>Status</strong>
          </div>
        </div>
        <div className="mt-2 w-full rounded-md border border-panel-border bg-panel-input p-4 capitalize">
          <div className="flex h-64 flex-col overflow-y-auto bg-panel-input">
            {items}
            {isLoading && (
              <div className="flex grow items-center justify-center">
                <Icon className="text-panel-text-primary" path={mdiLoading} spin size={3} />
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
