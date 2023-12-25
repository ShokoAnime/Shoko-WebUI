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
import { forEach } from 'lodash';
import { useEventCallback } from 'usehooks-ts';

import Button from '@/components/Input/Button';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import { useQueueOperationMutation } from '@/core/react-query/queue/mutations';
import { setQueueModalOpen } from '@/core/slices/mainpage';

import type { RootState } from '@/core/store';
import type { SignalRQueueType } from '@/core/types/signalr';

const icons = { hasher: mdiPoundBoxOutline, general: mdiFormatListBulletedSquare, image: mdiImageMultipleOutline };
const names = { hasher: 'Hasher', general: 'General', image: 'Images' };

function QueueProcessor() {
  const dispatch = useDispatch();
  const hasFetched = useSelector((state: RootState) => state.mainpage.fetched.queueStatus);
  const items = useSelector((state: RootState) => state.mainpage.queueStatus);
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const { mutate: queueOperation } = useQueueOperationMutation();
  const handleOperation = useEventCallback(
    (operation: string, queue?: string) => queueOperation({ operation, queue }),
  );

  const handleOpenQueueDialog = useEventCallback(() => {
    dispatch(setQueueModalOpen(true));
  });

  const renderItem = (key: keyof typeof icons, item: SignalRQueueType) => (
    <div className="flex flex-col" key={key}>
      <div className="flex justify-between">
        <div className="flex w-56 items-center">
          <Icon className="mr-4" path={icons[key]} size={1} />
          <span>
            {names[key]}
            &nbsp;-&nbsp;
            {item?.status ?? 'Idle'}
          </span>
        </div>
        <div className="flex font-semibold text-panel-text-important">{item.queueCount ?? 0}</div>
        <div className="flex items-center gap-x-2">
          {item?.status === 'Pausing' || item?.status === 'Paused'
            ? (
              <Button onClick={() => handleOperation('Start', key)} tooltip="Resume">
                <Icon className="text-panel-icon-action" path={mdiPlayCircleOutline} size={1} />
              </Button>
            )
            : (
              <Button onClick={() => handleOperation('Stop', key)} tooltip="Pause">
                <Icon className="text-panel-icon-action" path={mdiPauseCircleOutline} size={1} />
              </Button>
            )}
          <Button onClick={() => handleOperation('Clear', key)} tooltip="Clear">
            <Icon className="text-panel-icon-action" path={mdiCloseCircleOutline} size={1} />
          </Button>
        </div>
      </div>
      <div className="mt-2 flex h-12 break-all">
        {item?.description ?? 'Idle'}
      </div>
    </div>
  );

  const renderOptions = () => {
    let paused = false;

    forEach(items, (item) => {
      paused ||= item?.status === 'Pausing' || item?.status === 'Paused';
    });

    return (
      <div className="flex gap-x-2">
        <Button onClick={handleOpenQueueDialog} tooltip="Open Queue Modal">
          <Icon className="text-panel-icon-action" path={mdiTextBoxOutline} size={1} />
        </Button>
        {paused
          ? (
            <Button onClick={() => handleOperation('StartAll')} tooltip="Resume All">
              <Icon className="text-panel-icon-action" path={mdiPlayCircleOutline} size={1} />
            </Button>
          )
          : (
            <Button onClick={() => handleOperation('StopAll')} tooltip="Pause All">
              <Icon className="text-panel-icon-action" path={mdiPauseCircleOutline} size={1} />
            </Button>
          )}
        <Button onClick={() => handleOperation('ClearAll')} tooltip="Clear All">
          <Icon className="text-panel-icon-action" path={mdiCloseCircleOutline} size={1} />
        </Button>
      </div>
    );
  };

  const commands: React.ReactNode[] = [];

  if (items) {
    commands.push(renderItem('hasher', items.HasherQueueState));
    commands.push(renderItem('general', items.GeneralQueueState));
    commands.push(renderItem('image', items.ImageQueueState));
  }

  return (
    <ShokoPanel title="Queue Processor" options={renderOptions()} isFetching={!hasFetched} editMode={layoutEditMode}>
      <div className="flex h-full flex-col justify-between">
        {commands}
      </div>
    </ShokoPanel>
  );
}

export default QueueProcessor;
