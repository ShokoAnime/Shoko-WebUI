import React from 'react';

import Action from '@/components/Collection/Series/EditSeriesTabs/Action';
import toast from '@/components/Toast';
import {
  useAutoSearchTmdbMatchMutation,
  useRefreshSeriesAniDBInfoMutation,
  useRefreshSeriesTMDBInfoMutation,
  useUpdateSeriesTMDBImagesMutation,
} from '@/core/react-query/series/mutations';

type Props = {
  seriesId: number;
};

const UpdateActionsTab = ({ seriesId }: Props) => {
  const { mutate: refreshAnidb } = useRefreshSeriesAniDBInfoMutation();
  const { mutate: autoMatchTmdb } = useAutoSearchTmdbMatchMutation();
  const { mutate: refreshTmdb } = useRefreshSeriesTMDBInfoMutation();
  const { mutate: updateTmdbImages } = useUpdateSeriesTMDBImagesMutation();

  const triggerAnidbRefresh = (force: boolean, cacheOnly: boolean) => {
    refreshAnidb({ seriesId, force, cacheOnly }, {
      onSuccess: () => toast.success('AniDB refresh queued!'),
    });
  };

  return (
    <div className="shoko-scrollbar flex h-[22rem] grow flex-col gap-y-4 overflow-y-auto">
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
      <Action
        name="Auto-Search TMDB Match"
        description="Automatically searches for a TMDB match."
        onClick={() =>
          autoMatchTmdb(seriesId, {
            onSuccess: () => toast.success('TMDB refresh queued!'),
          })}
      />
      <Action
        name="Update TMDB Info"
        description="Gets the latest series information from TMDB."
        onClick={() =>
          refreshTmdb(seriesId, {
            onSuccess: () => toast.success('TMDB refresh queued!'),
          })}
      />
      <Action
        name="Update TMDB Images - Force"
        description="Forces a complete redownload of images from TMDB."
        onClick={() =>
          updateTmdbImages({ seriesId, force: true }, {
            onSuccess: () => toast.success('TMDB image download queued!'),
          })}
      />
    </div>
  );
};

export default UpdateActionsTab;
