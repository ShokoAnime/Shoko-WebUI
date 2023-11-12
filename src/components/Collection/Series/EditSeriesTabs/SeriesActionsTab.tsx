import React from 'react';
import { mdiPlayCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useEventCallback } from 'usehooks-ts';

import Button from '@/components/Input/Button';
import toast from '@/components/Toast';
import {
  useRefreshSeriesAnidbInfoMutation,
  useRefreshSeriesTvdbInfoMutation,
  useRehashSeriesFilesMutation,
  useRescanSeriesFilesMutation,
} from '@/core/rtkQuery/splitV3Api/seriesApi';

type Props = {
  seriesId: number;
};

const Action = ({ description, name, onClick }: { name: string, description: string, onClick: () => void }) => (
  <div
    className="mr-4 flex flex-row justify-between gap-y-2 border-b border-panel-border pb-4 last:border-0"
    onClick={onClick}
  >
    <div className="flex w-full max-w-[35rem] flex-col gap-y-2">
      <div>{name}</div>
      <div className="text-sm opacity-65">{description}</div>
    </div>
    <Button onClick={() => {}} className="text-panel-text-primary">
      <Icon path={mdiPlayCircleOutline} size={1} />
    </Button>
  </div>
);

const SeriesActionsTab = ({ seriesId }: Props) => {
  const [refreshAnidb] = useRefreshSeriesAnidbInfoMutation();
  const [refreshTvdb] = useRefreshSeriesTvdbInfoMutation();
  const [rehashSeriesFiles] = useRehashSeriesFilesMutation();
  const [rescanSeriesFiles] = useRescanSeriesFilesMutation();

  const triggerAnidbRefresh = useEventCallback((force: boolean, cacheOnly: boolean) => {
    refreshAnidb({ seriesId, force, cacheOnly })
      .then(() => toast.success('AniDB refresh queued!'))
      .catch(console.error);
  });

  return (
    <div className="flex h-[22rem] grow flex-col gap-y-4 overflow-y-scroll">
      <Action
        name="Rescan Files"
        description="Rescans every file associated with the series."
        onClick={() => {
          rescanSeriesFiles({ seriesId })
            .then(() => toast.success('Series files rescan queued!'))
            .catch(console.error);
        }}
      />
      <Action
        name="Rehash Files"
        description="Rehashes every file associated with the series."
        onClick={() => {
          rehashSeriesFiles({ seriesId })
            .then(() => toast.success('Series files rehash queued!'))
            .catch(console.error);
        }}
      />
      <Action
        name="Update TVDB Info"
        description="Gets the latest series information from TheTVDB database."
        onClick={() => {
          refreshTvdb({ seriesId })
            .then(() => toast.success('TvDB refresh queued!'))
            .catch(console.error);
        }}
      />
      <Action
        name="Update AniDB Info"
        description="Gets the latest series information from the AniDB database."
        onClick={() => triggerAnidbRefresh(false, false)}
      />
      <Action
        name="Update AniDB Info - Force"
        description="Forces a complete update from AniDB, bypassing usual checks."
        onClick={() => triggerAnidbRefresh(true, false)}
      />
      <Action
        name="Update AniDB Info - XML Cache"
        description="Updates AniDB data using information from local XML cache."
        onClick={() => triggerAnidbRefresh(false, true)}
      />
    </div>
  );
};

export default SeriesActionsTab;
