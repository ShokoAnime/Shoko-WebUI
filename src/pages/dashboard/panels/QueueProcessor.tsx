import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { forEach } from 'lodash';
import { Icon } from '@mdi/react';
import {
  mdiFormatListBulletedSquare,
  mdiPoundBoxOutline,
  mdiImageMultipleOutline,
  mdiPauseCircleOutline,
  mdiPlayCircleOutline,
  mdiCloseCircleOutline,
} from '@mdi/js';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import Button from '../../../components/Input/Button';
import type { QueueItemType } from '../../../core/types/signalr';
import ShokoPanel from '../../../components/Panels/ShokoPanel';

const icons = { hasher: mdiPoundBoxOutline, general: mdiFormatListBulletedSquare, images: mdiImageMultipleOutline };
const names = { hasher: 'Hasher', general: 'General', images: 'Images' };

function QueueProcessor() {
  const dispatch = useDispatch();

  const hasFetched = useSelector((state: RootState) => state.mainpage.fetched.queueStatus);
  const items = useSelector((state: RootState) => state.mainpage.queueStatus);

  const handleOperation = (value: string) => dispatch(
    { type: Events.MAINPAGE_QUEUE_OPERATION, payload: value },
  );

  const renderItem = (key: string, item: QueueItemType, count: number) => (
    <div className="flex flex-col mt-8 first:mt-0" key={key}>
      <div className="flex justify-between">
        <div className="flex items-center w-24">
          <Icon className="mr-4" path={icons[key]} size={1} />
          <span>{names[key]}</span>
        </div>
        <div className="flex text-highlight-2">{count ?? 0}</div>
        <div className="flex items-center">
          <Button className="mx-2" onClick={() => handleOperation!(`${names[key]}Clear`)} tooltip="Clear">
            <Icon className="text-highlight-1" path={mdiCloseCircleOutline} size={1} />
          </Button>
          {item?.state === 18 ? (
            <Button className="mx-2" onClick={() => handleOperation!(`${names[key]}Start`)} tooltip="Resume">
              <Icon className="text-highlight-1" path={mdiPlayCircleOutline} size={1} />
            </Button>
          ) : (
            <Button className="mx-2" onClick={() => handleOperation!(`${names[key]}Pause`)} tooltip="Pause">
              <Icon className="text-highlight-1" path={mdiPauseCircleOutline} size={1} />
            </Button>
          )}
        </div>
      </div>
      <div className="flex break-all h-12 mt-2">
        {item?.description ?? 'Idle'}
      </div>
    </div>
  );

  const renderOptions = () => {
    let paused = true;

    forEach(items, (item) => {
      if (typeof item === 'number') return;
      paused = item?.state === 18;
    });

    return (
      <React.Fragment>
        {paused ? (
          <div className="text-highlight-1 mx-2 cursor-pointer" onClick={() => handleOperation!('Start')} title="Resume All">
            <Icon path={mdiPlayCircleOutline} size={1} horizontal vertical rotate={180} />
          </div>
        ) : (
          <div className="text-highlight-1 mx-2 cursor-pointer" onClick={() => handleOperation!('Pause')} title="Pause All">
            <Icon path={mdiPauseCircleOutline} size={1} horizontal vertical rotate={180} />
          </div>
        )}
      </React.Fragment>
    );
  };

  const commands: Array<React.ReactNode> = [];

  if (items) {
    commands.push(renderItem('hasher', items.HasherQueueState, items.HasherQueueCount));
    commands.push(renderItem('general', items.GeneralQueueState, items.GeneralQueueCount));
    commands.push(renderItem('images', items.ImageQueueState, items.ImageQueueCount));
  }

  return (
    <ShokoPanel title="Queue Processor" options={renderOptions()} isFetching={!hasFetched}>
      <div className="flex flex-col justify-between h-full">
        {commands}
      </div>
    </ShokoPanel>
  );
}

export default QueueProcessor;
