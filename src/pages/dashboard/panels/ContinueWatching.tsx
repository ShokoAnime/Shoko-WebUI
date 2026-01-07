import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { map } from 'lodash';

import ShokoPanel from '@/components/Panels/ShokoPanel';
import { useDashboardContinueWatchingQuery } from '@/core/react-query/dashboard/queries';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import EpisodeDetails from '@/pages/dashboard/components/EpisodeDetails';

import type { RootState } from '@/core/store';

const ContinueWatching = () => {
  const { t } = useTranslation('panels');
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const { hideR18Content } = useSettingsQuery().data.WebUI_Settings.dashboard;

  const continueWatchingQuery = useDashboardContinueWatchingQuery({ includeRestricted: !hideR18Content, pageSize: 20 });

  return (
    <ShokoPanel
      title={t('recommendedAnime.title')}
      isFetching={continueWatchingQuery.isPending}
      editMode={layoutEditMode}
      contentClassName="!flex-row gap-x-6"
    >
      {(!continueWatchingQuery.data || continueWatchingQuery.data.length === 0) && (
        <div className="flex size-full flex-col justify-center gap-y-2 pb-10 text-center">
          <div>{t('recommendedAnime.emptyTitle')}</div>
          <div>{t('recommendedAnime.emptyDescription')}</div>
        </div>
      )}

      {map(
        continueWatchingQuery.data,
        item => <EpisodeDetails episode={item} key={item.IDs.ID} />,
      )}
    </ShokoPanel>
  );
};

export default ContinueWatching;
