import React from 'react';

import Action from '@/components/Collection/Series/EditSeriesTabs/Action';
import toast from '@/components/Toast';
import {
  useRefreshSeriesAniDBInfoMutation,
  useRefreshSeriesTvdbInfoMutatation,
} from '@/core/react-query/series/mutations';

type Props = {
  seriesId: number;
};

const UpdateActionsTab = ({ seriesId }: Props) => {
  const { mutate: refreshAnidb } = useRefreshSeriesAniDBInfoMutation();
  const { mutate: refreshTvdb } = useRefreshSeriesTvdbInfoMutatation();

  const triggerAnidbRefresh = (force: boolean, cacheOnly: boolean) => {
    refreshAnidb({ seriesId, force, cacheOnly }, {
      onSuccess: () => toast.success('AniDB refresh queued!'),
    });
  };

  return (
    <div className="flex h-[22rem] grow flex-col gap-y-4 overflow-y-auto">
      <Action
        name="Update TVDB Info"
        description="Gets the latest series information from TheTVDB database."
        onClick={() =>
          refreshTvdb({ seriesId }, {
            onSuccess: () => toast.success('TvDB refresh queued!'),
          })}
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

export default UpdateActionsTab;
