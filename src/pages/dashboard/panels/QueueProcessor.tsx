import React from 'react';
import { useSelector } from 'react-redux';
import { mdiCloseCircleOutline, mdiPauseCircleOutline, mdiPlayCircleOutline, mdiRefresh } from '@mdi/js';
import { Icon } from '@mdi/react';

import Button from '@/components/Input/Button';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import {
  useQueueClearMutation,
  useQueuePauseMutation,
  useQueueResumeMutation,
} from '@/core/react-query/queue/mutations';
import { useQueueItemsQuery } from '@/core/react-query/queue/queries';
import useEventCallback from '@/hooks/useEventCallback';

import type { RootState } from '@/core/store';
import type { QueueItemType } from '@/core/types/signalr';

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

const Item = ({ item }: { item: QueueItemType }) => (
  <div className="mr-3 flex items-center justify-between gap-x-2 rounded-md p-3 even:bg-panel-background-alt">
    <div className="flex flex-col gap-y-1">
      <span className="text-sm opacity-65">{item.Type}</span>
      {item.Description}
    </div>
    {item.IsRunning && <Icon path={mdiRefresh} size={1.1} className="text-panel-text-primary" />}
  </div>
);

function QueueProcessor() {
  const hasFetched = useSelector((state: RootState) => state.mainpage.fetched.queueStatus);
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);
  const queueItemsQuery = useQueueItemsQuery({ pageSize: 100 });

  return (
    <ShokoPanel
      title={<Title />}
      options={<Options />}
      isFetching={!hasFetched || queueItemsQuery.isPending}
      editMode={layoutEditMode}
    >
      {queueItemsQuery.data && queueItemsQuery.data?.Total > 0
        ? queueItemsQuery.data.List.filter(item => item.Description).map(item => <Item item={item} key={item.Key} />)
        : <div className="flex grow items-center justify-center font-semibold">Queue is empty!</div>}
    </ShokoPanel>
  );
}

export default QueueProcessor;
