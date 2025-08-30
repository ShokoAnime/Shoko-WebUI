import React from 'react';
import { useSelector } from 'react-redux';
import { mdiCloseCircleOutline, mdiPauseCircleOutline, mdiPlayCircleOutline, mdiProgressClock } from '@mdi/js';
import { Icon } from '@mdi/react';
import { map } from 'lodash';

import Button from '@/components/Input/Button';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import {
  useQueueClearMutation,
  useQueuePauseMutation,
  useQueueResumeMutation,
} from '@/core/react-query/queue/mutations';
import { useQueueItemsQuery } from '@/core/react-query/queue/queries';
import { dayjs } from '@/core/util';
import useEventCallback from '@/hooks/useEventCallback';

import type { QueueItemType } from '@/core/signalr/types';
import type { RootState } from '@/core/store';

const Options = () => {
  const queue = useSelector((state: RootState) => state.mainpage.queueStatus);

  const { mutate: clearQueue } = useQueueClearMutation();
  const { mutate: pauseQueue } = useQueuePauseMutation();
  const { mutate: resumeQueue } = useQueueResumeMutation();

  const handleResume = useEventCallback(() => resumeQueue());
  const handlePause = useEventCallback(() => pauseQueue());
  const handleClear = useEventCallback(() => clearQueue());

  return (
    <div className="flex gap-x-2">
      {queue.Running
        ? (
          <Button onClick={handlePause} tooltip="Pause All">
            <Icon className="text-panel-icon-action" path={mdiPauseCircleOutline} size={1} />
          </Button>
        )
        : (
          <Button onClick={handleResume} tooltip="Resume All">
            <Icon className="text-panel-icon-action" path={mdiPlayCircleOutline} size={1} />
          </Button>
        )}
      <Button onClick={handleClear} tooltip="Clear All">
        <Icon className="text-panel-icon-action" path={mdiCloseCircleOutline} size={1} />
      </Button>
    </div>
  );
};

const Title = () => {
  const queue = useSelector((state: RootState) => state.mainpage.queueStatus);

  return (
    <div className="flex items-center">
      Queue Processor |&nbsp;
      <div>
        <span className="text-panel-text-important">{queue.ThreadCount}</span>
        &nbsp;Workers
      </div>
      &nbsp;|&nbsp;
      <div>
        <span className="text-panel-text-important">{queue.TotalCount}</span>
        &nbsp;Tasks
      </div>
      {!queue.Running && (
        <>
          &nbsp;|&nbsp;
          <div className="text-panel-text-important">
            Paused
          </div>
        </>
      )}
    </div>
  );
};

const QueueItem = ({ item }: { item: QueueItemType }) => (
  <div className="mr-3 flex items-center justify-between gap-x-2 rounded-md p-3 even:bg-panel-background-alt">
    <div className="flex flex-col gap-y-1 break-all">
      <span className="text-sm opacity-65">
        {item.IsRunning ? item.Title : item.Type}
        {item.StartTime && ` | ${dayjs(item.StartTime).format('MMMM DD YYYY, HH:mm')}`}
      </span>
      {map(item.Details, (value, key) => `${key}: ${value}`).join(', ')}
    </div>
    {item.IsRunning && <Icon path={mdiProgressClock} size={1} className="shrink-0 text-panel-text-primary" />}
  </div>
);

const QueueItems = () => { // This is a separate component so that the whole ShokoPanel doesn't re-render on queue items change
  const queueItemsQuery = useQueueItemsQuery({ pageSize: 100, showAll: true });

  return queueItemsQuery.data && queueItemsQuery.data?.Total > 0
    ? queueItemsQuery.data.List.map(item => <QueueItem item={item} key={item.Key} />)
    : <div className="flex grow items-center justify-center pb-14 font-semibold">Queue is empty!</div>;
};

const QueueProcessor = () => {
  const hasFetched = useSelector((state: RootState) => state.mainpage.fetched.queueStatus);
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  return (
    <ShokoPanel
      title={<Title />}
      options={<Options />}
      isFetching={!hasFetched}
      editMode={layoutEditMode}
    >
      <QueueItems />
    </ShokoPanel>
  );
};

export default QueueProcessor;
