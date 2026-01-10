import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { produce } from 'immer';
import { map } from 'lodash';

import MultiStateButton from '@/components/Input/MultiStateButton';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import TransitionDiv from '@/components/TransitionDiv';
import {
  useDashboardRecentlyAddedEpisodesQuery,
  useDashboardRecentlyAddedSeriesQuery,
} from '@/core/react-query/dashboard/queries';
import { usePatchSettingsMutation } from '@/core/react-query/settings/mutations';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import EpisodeDetails from '@/pages/dashboard/components/EpisodeDetails';
import SeriesDetails from '@/pages/dashboard/components/SeriesDetails';

import type { RootState } from '@/core/store';

const RecentlyImported = () => {
  const { t } = useTranslation('panels');
  const tabStates = React.useMemo(
    () => [
      { label: t('recentlyImported.tabs.episodes'), value: 'episodes' },
      { label: t('recentlyImported.tabs.series'), value: 'series' },
    ],
    [t],
  );
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const settings = useSettingsQuery().data;
  const {
    hideR18Content,
    recentlyImportedEpisodesCount,
    recentlyImportedSeriesCount,
    recentlyImportedView,
  } = settings.WebUI_Settings.dashboard;
  const { mutate: patchSettings } = usePatchSettingsMutation();

  const recentSeriesQuery = useDashboardRecentlyAddedSeriesQuery({
    includeRestricted: !hideR18Content,
    pageSize: recentlyImportedSeriesCount,
  });
  const recentEpisodesQuery = useDashboardRecentlyAddedEpisodesQuery({
    includeRestricted: !hideR18Content,
    pageSize: recentlyImportedEpisodesCount,
  });

  const [viewMode, setViewMode] = useState<'episodes' | 'series'>('episodes');

  useEffect(() => {
    setViewMode(recentlyImportedView);
  }, [recentlyImportedView]);

  const handleTabChange = (newTab: 'episodes' | 'series') => {
    setViewMode(newTab);
    const newSettings = produce(settings, (draftState) => {
      draftState.WebUI_Settings.dashboard.recentlyImportedView = newTab;
    });
    patchSettings({ newSettings });
  };

  return (
    <ShokoPanel
      title={t('recentlyImported.title')}
      editMode={layoutEditMode}
      isFetching={viewMode === 'series' ? recentSeriesQuery.isPending : recentEpisodesQuery.isPending}
      options={
        <MultiStateButton
          activeState={viewMode}
          states={tabStates}
          onStateChange={handleTabChange}
          alternateColor
        />
      }
      contentClassName="relative"
    >
      <TransitionDiv
        show={viewMode !== 'series'}
        className="absolute flex size-full gap-x-6"
      >
        {(!recentEpisodesQuery.data || recentEpisodesQuery.data.length === 0) && (
          <div className="flex size-full flex-col justify-center pb-10 text-center">
            {t('recentlyImported.emptyEpisodes')}
          </div>
        )}

        {map(
          recentEpisodesQuery.data,
          item => <EpisodeDetails episode={item} key={`${item.IDs.ShokoEpisode}-${item.IDs.ShokoFile}`} />,
        )}
      </TransitionDiv>

      <TransitionDiv
        show={viewMode === 'series'}
        className="absolute flex size-full gap-x-6"
      >
        {(!recentSeriesQuery.data || recentSeriesQuery.data.length === 0) && (
          <div className="flex size-full flex-col justify-center pb-10 text-center">
            {t('recentlyImported.emptySeries')}
          </div>
        )}

        {map(
          recentSeriesQuery.data,
          item => <SeriesDetails series={item} key={item.IDs.ID} />,
        )}
      </TransitionDiv>
    </ShokoPanel>
  );
};

export default RecentlyImported;
