import React from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('series');
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
        name={t('actions.update.anidb.name')}
        description={t('actions.update.anidb.description')}
        onClick={() => triggerAnidbRefresh(false, false)}
      />
      <Action
        name={t('actions.update.anidbForce.name')}
        description={t('actions.update.anidbForce.description')}
        onClick={() => triggerAnidbRefresh(true, false)}
      />
      <Action
        name={t('actions.update.anidbCache.name')}
        description={t('actions.update.anidbCache.description')}
        onClick={() => triggerAnidbRefresh(false, true)}
      />
      <Action
        name={t('actions.update.tmdbAuto.name')}
        description={t('actions.update.tmdbAuto.description')}
        onClick={autoMatchTmdb}
      />
      <Action
        name={t('actions.update.tmdb.name')}
        description={t('actions.update.tmdb.description')}
        onClick={refreshTmdb}
      />
      <Action
        name={t('actions.update.tmdbImagesForce.name')}
        description={t('actions.update.tmdbImagesForce.description')}
        onClick={updateTmdbImagesForce}
      />
      <Action
        name={t('actions.update.trakt.name')}
        description={t('actions.update.trakt.description')}
        onClick={refreshTrakt}
      />
      <Action
        name={t('actions.update.traktSync.name')}
        description={t('actions.update.traktSync.description')}
        onClick={syncTrakt}
      />
    </div>
  );
};

export default UpdateActionsTab;
