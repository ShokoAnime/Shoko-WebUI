import React from 'react';

import Action from '@/components/Collection/Series/EditSeriesTabs/Action';
import {
  useAutoSearchTmdbMatchMutation,
  useGetSeriesWatchStatesFromTraktMutation,
  useRefreshSeriesAniDBInfoMutation,
  useRefreshSeriesTMDBInfoMutation,
  useSendSeriesWatchStatesToTraktMutation,
  useUpdateSeriesTMDBImagesMutation,
} from '@/core/react-query/series/mutations';
import { useSettingsQuery } from '@/core/react-query/settings/queries';

type Props = {
  seriesId: number;
};

const UpdateActionsTab = ({ seriesId }: Props) => {
  const { TraktTv } = useSettingsQuery().data;

  const { mutate: refreshAnidb } = useRefreshSeriesAniDBInfoMutation(seriesId);
  const { mutate: autoMatchTmdb } = useAutoSearchTmdbMatchMutation(seriesId);
  const { mutate: refreshTmdb } = useRefreshSeriesTMDBInfoMutation(seriesId);
  const { mutate: updateTmdbImagesMutation } = useUpdateSeriesTMDBImagesMutation(seriesId);
  const { mutate: sendWatchStatesToTrakt } = useSendSeriesWatchStatesToTraktMutation(seriesId);
  const { mutate: getWatchStatesFromTrakt } = useGetSeriesWatchStatesFromTraktMutation(seriesId);

  const triggerAnidbRefresh = (force: boolean, cacheOnly: boolean) => {
    refreshAnidb({ force, cacheOnly });
  };

  const updateTmdbImagesForce = () => {
    updateTmdbImagesMutation({ force: true });
  };

  return (
    <div className="flex h-88 grow flex-col gap-y-4 overflow-y-auto">
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
      {TraktTv.Enabled && TraktTv.AuthToken && (
        <>
          <Action
            name="Send Watch States to Trakt"
            description="Sends missing episode watch states to Trakt. This does not overwrite Trakt data."
            onClick={sendWatchStatesToTrakt}
          />
          <Action
            name="Get Watch States from Trakt"
            description="Gets missing episode watch states from Trakt. This does not overwrite local data."
            onClick={getWatchStatesFromTrakt}
          />
        </>
      )}
    </div>
  );
};

export default UpdateActionsTab;
