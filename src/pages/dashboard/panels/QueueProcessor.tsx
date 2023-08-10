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
import type { SignalRQueueType } from '@/core/types/signalr';
import ShokoPanel from '@/components/Panels/ShokoPanel';

import { useGetQueueOperationMutation } from '@/core/rtkQuery/splitV3Api/queueApi';
import { setQueueModalOpen } from '@/core/slices/mainpage';

import type { RootState } from '@/core/store';
import type { QueueItemType } from '@/core/types/signalr';

const icons = { hasher: mdiPoundBoxOutline, general: mdiFormatListBulletedSquare, image: mdiImageMultipleOutline };
const names = { hasher: 'Hasher', general: 'General', image: 'Images' };

function QueueProcessor() {
  const dispatch = useDispatch();
  const hasFetched = useSelector((state: RootState) => state.mainpage.fetched.queueStatus);
  const items = useSelector((state: RootState) => state.mainpage.queueStatus);
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const [queueOperation] = useGetQueueOperationMutation();
  const handleOperation = useEventCallback(async (operation: string, queue?: string) => {
    await queueOperation({ operation, queue });
  });

  const handleOpenQueueDialog = useEventCallback(() => {
    dispatch(setQueueModalOpen(true));
  });

  const renderItem = (key: string, item: SignalRQueueType) => (
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
        <div className="flex text-panel-important">{item.queueCount ?? 0}</div>
        <div className="flex items-center">
          {item?.status === 'Pausing' || item?.status === 'Paused' ? (
            <Button className="mx-2" onClick={() => handleOperation('Start', key)} tooltip="Resume">
              <Icon className="text-panel-primary" path={mdiPlayCircleOutline} size={1} />
            </Button>
          ) : (
            <Button className="mx-2" onClick={() => handleOperation('Stop', key)} tooltip="Pause">
              <Icon className="text-panel-primary" path={mdiPauseCircleOutline} size={1} />
            </Button>
          )}
          <Button className="mx-2" onClick={() => handleOperation('Clear', key)} tooltip="Clear">
            <Icon className="text-panel-primary" path={mdiCloseCircleOutline} size={1} />
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
      <>
        {paused ? (
          <div className="text-panel-primary mx-2 cursor-pointer" onClick={() => handleOperation('StartAll')} title="Resume All">
            <Icon path={mdiPlayCircleOutline} size={1} horizontal vertical rotate={180} />
          </div>
        ) : (
          <div className="text-panel-primary mx-2 cursor-pointer" onClick={() => handleOperation('StopAll')} title="Pause All">
            <Icon path={mdiPauseCircleOutline} size={1} horizontal vertical rotate={180} />
          </div>
        )}
        <Button className="mx-2" onClick={() => handleOperation('ClearAll')} tooltip="Clear All">
          <Icon className="text-panel-primary" path={mdiCloseCircleOutline} size={1} />
        </Button>
        <Button className="mx-2" onClick={handleOpenQueueDialog} tooltip="Open Queue Modal">
          <Icon className="text-panel-primary" path={mdiTextBoxOutline} size={1} />
        </Button>
      </>
    );
  };

  const commands: Array<React.ReactNode> = [];

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
