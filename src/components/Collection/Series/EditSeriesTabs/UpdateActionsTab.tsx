import React from 'react';

import Action from '@/components/Collection/Series/EditSeriesTabs/Action';
import {
  useAutoSearchTmdbMatchMutation,
  useRefreshSeriesAniDBInfoMutation,
  useRefreshSeriesTMDBInfoMutation,
  useRefreshSeriesTraktInfoMutation,
  useSyncSeriesTraktMutation,
  useUpdateSeriesTMDBImagesMutation,
} from '@/core/react-query/series/mutations';
import useEventCallback from '@/hooks/useEventCallback';

type Props = {
  seriesId: number;
};

const UpdateActionsTab = ({ seriesId }: Props) => {
  const { mutate: refreshAnidb } = useRefreshSeriesAniDBInfoMutation(seriesId);
  const { mutate: autoMatchTmdb } = useAutoSearchTmdbMatchMutation(seriesId);
  const { mutate: refreshTmdb } = useRefreshSeriesTMDBInfoMutation(seriesId);
  const { mutate: updateTmdbImagesMutation } = useUpdateSeriesTMDBImagesMutation(seriesId);
  const { mutate: refreshTrakt } = useRefreshSeriesTraktInfoMutation(seriesId);
  const { mutate: syncTrakt } = useSyncSeriesTraktMutation(seriesId);

  const triggerAnidbRefresh = (force: boolean, cacheOnly: boolean) => {
    refreshAnidb({ force, cacheOnly });
  };

  const updateTmdbImagesForce = useEventCallback(() => {
    updateTmdbImagesMutation({ force: true });
  });

  return (
    <div className="flex h-[22rem] grow flex-col gap-y-4 overflow-y-auto">
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
        onClick={autoMatchTmdb}
      />
      <Action
        name="Update TMDB Info"
        description="Gets the latest series information from TMDB."
        onClick={refreshTmdb}
      />
      <Action
        name="Update TMDB Images - Force"
        description="Forces a complete redownload of images from TMDB."
        onClick={updateTmdbImagesForce}
      />
      <Action
        name="Update Trakt Show Info"
        description="Gets the latest show information from Trakt."
        onClick={refreshTrakt}
      />
      <Action
        name="Sync Trakt Status"
        description="Syncs episode status between Shoko and Trakt."
        onClick={syncTrakt}
      />
    </div>
  );
};

export default UpdateActionsTab;
