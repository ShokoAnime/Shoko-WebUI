import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  mdiCloseCircleOutline,
  mdiFormatListBulletedSquare,
  mdiImageMultipleOutline,
  mdiPauseCircleOutline,
  mdiPlayCircleOutline,
  mdiPoundBoxOutline,
  mdiTextBoxOutline,
} from '@mdi/js';
import { Icon } from '@mdi/react';
import { some } from 'lodash';

import Button from '@/components/Input/Button';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import { useQueueOperationMutation } from '@/core/react-query/queue/mutations';
import { setQueueModalOpen } from '@/core/slices/mainpage';
import useEventCallback from '@/hooks/useEventCallback';

import type { RootState } from '@/core/store';
import type { SignalRQueueType } from '@/core/types/signalr';

const icons = { hasher: mdiPoundBoxOutline, general: mdiFormatListBulletedSquare, image: mdiImageMultipleOutline };
const names = { hasher: 'Hasher', general: 'General', image: 'Images' };

const QueueItem = ({ item, queue }: { queue: keyof typeof icons, item: SignalRQueueType }) => {
  const { mutate: queueOperation } = useQueueOperationMutation();

  const handleStart = useEventCallback(() => queueOperation({ operation: 'Start', queue }));
  const handleStop = useEventCallback(() => queueOperation({ operation: 'Stop', queue }));
  const handleClear = useEventCallback(() => queueOperation({ operation: 'Clear', queue }));

  return (
    <div className="flex flex-col">
      <div className="flex justify-between">
        <div className="flex w-56 items-center">
          <Icon className="mr-4" path={icons[queue]} size={1} />
          <span>
            {names[queue]}
            &nbsp;-&nbsp;
            {item?.status ?? 'Idle'}
          </span>
        </div>
        <div className="flex font-semibold text-panel-text-important">{item.queueCount ?? 0}</div>
        <div className="flex items-center gap-x-2">
          {item?.status === 'Pausing' || item?.status === 'Paused'
            ? (
              <Button onClick={handleStart} tooltip="Resume">
                <Icon className="text-panel-icon-action" path={mdiPlayCircleOutline} size={1} />
              </Button>
            )
            : (
              <Button onClick={handleStop} tooltip="Pause">
                <Icon className="text-panel-icon-action" path={mdiPauseCircleOutline} size={1} />
              </Button>
            )}
          <Button onClick={handleClear} tooltip="Clear">
            <Icon className="text-panel-icon-action" path={mdiCloseCircleOutline} size={1} />
          </Button>
        </div>
      </div>
      <div className="mt-2 flex h-12 break-all">
        {item?.description ?? 'Idle'}
      </div>
    </div>
  );
};

const Options = () => {
  const dispatch = useDispatch();
  const items = useSelector((state: RootState) => state.mainpage.queueStatus);

  const { mutate: queueOperation } = useQueueOperationMutation();

  const handleStart = useEventCallback(() => queueOperation({ operation: 'StartAll' }));
  const handleStop = useEventCallback(() => queueOperation({ operation: 'StopAll' }));
  const handleClear = useEventCallback(() => queueOperation({ operation: 'ClearAll' }));

  const paused = some(items, item => item?.status === 'Pausing' || item?.status === 'Paused');

  const handleOpenQueueDialog = useEventCallback(() => dispatch(setQueueModalOpen(true)));

  return (
    <div className="flex gap-x-2">
      <Button onClick={handleOpenQueueDialog} tooltip="Open Queue Modal">
        <Icon className="text-panel-icon-action" path={mdiTextBoxOutline} size={1} />
      </Button>
      {paused
        ? (
          <Button onClick={handleStart} tooltip="Resume All">
            <Icon className="text-panel-icon-action" path={mdiPlayCircleOutline} size={1} />
          </Button>
        )
        : (
          <Button onClick={handleStop} tooltip="Pause All">
            <Icon className="text-panel-icon-action" path={mdiPauseCircleOutline} size={1} />
          </Button>
        )}
      <Button onClick={handleClear} tooltip="Clear All">
        <Icon className="text-panel-icon-action" path={mdiCloseCircleOutline} size={1} />
      </Button>
    </div>
  );
};

function QueueProcessor() {
  const hasFetched = useSelector((state: RootState) => state.mainpage.fetched.queueStatus);
  const items = useSelector((state: RootState) => state.mainpage.queueStatus);
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  return (
    <ShokoPanel title="Queue Processor" options={<Options />} isFetching={!hasFetched} editMode={layoutEditMode}>
      {items && (
        <div className="flex h-full flex-col justify-between">
          <QueueItem queue="hasher" item={items.HasherQueueState} />
          <QueueItem queue="general" item={items.GeneralQueueState} />
          <QueueItem queue="image" item={items.ImageQueueState} />
        </div>
      )}
    </ShokoPanel>
  );
}

export default QueueProcessor;
