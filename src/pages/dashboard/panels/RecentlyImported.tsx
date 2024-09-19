import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { produce } from 'immer';

import MultiStateButton from '@/components/Input/MultiStateButton';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import TransitionDiv from '@/components/TransitionDiv';
import {
  useDashboardRecentlyAddedEpisodesQuery,
  useDashboardRecentlyAddedSeriesQuery,
} from '@/core/react-query/dashboard/queries';
import { usePatchSettingsMutation } from '@/core/react-query/settings/mutations';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import useEventCallback from '@/hooks/useEventCallback';
import EpisodeDetails from '@/pages/dashboard/components/EpisodeDetails';
import SeriesDetails from '@/pages/dashboard/components/SeriesDetails';

import type { RootState } from '@/core/store';

const tabStates: { label?: string, value: string }[] = [
  { label: 'Episodes', value: 'episodes' },
  { label: 'Series', value: 'series' },
];

const RecentlyImported = () => {
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

  const handleTabChange = useEventCallback((newTab: 'episodes' | 'series') => {
    setViewMode(newTab);
    const newSettings = produce(settings, (draftState) => {
      draftState.WebUI_Settings.dashboard.recentlyImportedView = newTab;
    });
    patchSettings({ newSettings });
  });

  return (
    <ShokoPanel
      title="Recently Imported"
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
    >
      <div className="shoko-scrollbar relative flex">
        <TransitionDiv show={viewMode !== 'series'} className="absolute flex w-full">
          {(recentEpisodesQuery.data?.length ?? 0) > 0
            ? recentEpisodesQuery.data?.map(item => (
              <EpisodeDetails episode={item} key={`${item.IDs.ShokoEpisode}-${item.IDs.ShokoFile}`} />
            ))
            : <div className="flex w-full justify-center font-semibold">No Recently Imported Episodes!</div>}
        </TransitionDiv>
        <TransitionDiv show={viewMode === 'series'} className="absolute flex w-full">
          {(recentSeriesQuery.data?.length ?? 0) > 0
            ? recentSeriesQuery.data?.map(item => <SeriesDetails series={item} key={item.IDs.ID} />)
            : <div className="flex w-full justify-center font-semibold">No Recently Imported Series!</div>}
        </TransitionDiv>
      </div>
    </ShokoPanel>
  );
};

export default RecentlyImported;
