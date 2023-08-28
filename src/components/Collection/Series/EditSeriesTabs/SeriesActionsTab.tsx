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

const Action = ({ name, onClick }: { name: string, onClick: () => void }) => (
  <div className="flex justify-between gap-x-3" onClick={onClick}>
    {name}
    <Button onClick={() => {}} className="text-panel-primary">
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
      .catch(() => toast.error('AniDB refresh failed!'));
  });

  return (
    <div className="flex grow flex-col gap-y-2">
      <Action
        name="Rescan Files"
        onClick={() => {
          rescanSeriesFiles({ seriesId })
            .then(() => toast.success('Series files rescan queued!'))
            .catch(() => toast.error('Series files rescan failed!'));
        }}
      />
      <Action
        name="Rehash Files"
        onClick={() => {
          rehashSeriesFiles({ seriesId })
            .then(() => toast.success('Series files rehash queued!'))
            .catch(() => toast.error('Series files rehash failed!'));
        }}
      />
      <Action
        name="Update TVDB Info"
        onClick={() => {
          refreshTvdb({ seriesId })
            .then(() => toast.success('TvDB refresh queued!'))
            .catch(() => toast.error('TvDB refresh failed!'));
        }}
      />
      <Action name="Update AniDB Info" onClick={() => triggerAnidbRefresh(false, false)} />
      <Action name="Update AniDB Info - Force" onClick={() => triggerAnidbRefresh(true, false)} />
      <Action name="Update AniDB Info - XML Cache" onClick={() => triggerAnidbRefresh(false, true)} />
    </div>
  );
};

export default SeriesActionsTab;
