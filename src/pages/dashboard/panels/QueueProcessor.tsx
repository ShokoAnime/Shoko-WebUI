import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { forEach } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTasks, faListAlt, faImage, faTimes, faPause, faPlay,
} from '@fortawesome/free-solid-svg-icons';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import FixedPanel from '../../../components/Panels/FixedPanel';
import Button from '../../../components/Input/Button';
import type { QueueItemType } from '../../../core/types/api';

const icons = { hasher: faTasks, general: faListAlt, images: faImage };
const names = { hasher: 'Hasher', general: 'General', images: 'Images' };

function QueueProcessor() {
  const dispatch = useDispatch();

  const hasFetched = useSelector((state: RootState) => state.mainpage.fetched.queueStatus);
  const items = useSelector((state: RootState) => state.mainpage.queueStatus);

  const handleOperation = (value: string) => dispatch(
    { type: Events.MAINPAGE_QUEUE_OPERATION, payload: value },
  );

  const renderItem = (key: string, item: QueueItemType, count: number) => (
    <div className="flex flex-col" key={key}>
      <div className="flex justify-between">
        <div className="flex items-center w-24">
          <FontAwesomeIcon icon={icons[key]} className="mr-4" />
          <span className="font-semibold">{names[key]}</span>
        </div>
        <div className="flex">{count ?? 0}</div>
        <div className="flex items-center">
          <Button className="color-highlight-1 mx-2" onClick={() => handleOperation!(`${names[key]}Clear`)} tooltip="Clear">
            <FontAwesomeIcon icon={faTimes} />
          </Button>
          {item?.state === 18 ? (
            <Button className="color-highlight-1 mx-2" onClick={() => handleOperation!(`${names[key]}Start`)} tooltip="Resume">
              <FontAwesomeIcon icon={faPlay} />
            </Button>
          ) : (
            <Button className="color-highlight-1 mx-2" onClick={() => handleOperation!(`${names[key]}Pause`)} tooltip="Pause">
              <FontAwesomeIcon icon={faPause} />
            </Button>
          )}
        </div>
      </div>
      <div className="flex break-all queue-item mt-2">
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
      <div>
        {paused ? (
          <Button className="color-highlight-1 mx-2" onClick={() => handleOperation!('Start')} tooltip="Resume All">
            <FontAwesomeIcon icon={faPlay} />
          </Button>
        ) : (
          <Button className="color-highlight-1 mx-2" onClick={() => handleOperation!('Pause')} tooltip="Pause All">
            <FontAwesomeIcon icon={faPause} />
          </Button>
        )}
      </div>
    );
  };

  const commands: Array<React.ReactNode> = [];

  if (items) {
    commands.push(renderItem('hasher', items.HasherQueueState, items.HasherQueueCount));
    commands.push(renderItem('general', items.GeneralQueueState, items.GeneralQueueCount));
    commands.push(renderItem('images', items.ImageQueueState, items.ImageQueueCount));
  }

  return (
    <FixedPanel title="Queue Processor" options={renderOptions()} isFetching={!hasFetched}>
      <div className="flex flex-col justify-between h-full">
        {commands}
      </div>
    </FixedPanel>
  );
}

export default QueueProcessor;
