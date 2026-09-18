import { produce } from 'immer';
import { map } from 'lodash';

import MultiStateButton from '@/components/Input/MultiStateButton';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import TransitionDiv from '@/components/TransitionDiv';
import {
  useDashboardRecentlyAddedEpisodesQuery,
  useDashboardRecentlyAddedSeriesQuery,
} from '@/core/react-query/dashboard/queries';
import queryClient from '@/core/react-query/queryClient';
import { usePatchSettingsMutation } from '@/core/react-query/settings/mutations';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import { useSelector } from '@/core/store';
import EpisodeDetails from '@/pages/dashboard/components/EpisodeDetails';
import SeriesDetails from '@/pages/dashboard/components/SeriesDetails';

import type { SettingsServerType } from '@/core/types/api/settings';

const tabStates: { label?: string, value: string }[] = [
  { label: 'Episodes', value: 'episodes' },
  { label: 'Series', value: 'series' },
];

const RecentlyImported = () => {
  const layoutEditMode = useSelector(state => state.mainpage.layoutEditMode);

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

  const handleTabChange = (newTab: 'episodes' | 'series') => {
    const newSettings = produce(settings, (draftState) => {
      draftState.WebUI_Settings.dashboard.recentlyImportedView = newTab;
    });
    // Optimistically write the new settings to the cache so the tab switches immediately,
    // without waiting for the patch + refetch round trip. The cache holds the raw server
    // shape, so WebUI_Settings must be re-stringified.
    queryClient.setQueryData<SettingsServerType>(['settings'], {
      ...newSettings,
      WebUI_Settings: JSON.stringify(newSettings.WebUI_Settings),
    });
    patchSettings(newSettings);
  };

  return (
    <ShokoPanel
      title="Recently Imported"
      editMode={layoutEditMode}
      isFetching={recentlyImportedView === 'series' ? recentSeriesQuery.isPending : recentEpisodesQuery.isPending}
      options={
        <MultiStateButton
          activeState={recentlyImportedView}
          states={tabStates}
          onStateChange={handleTabChange}
          alternateColor
        />
      }
      contentClassName="relative"
    >
      <TransitionDiv
        show={recentlyImportedView !== 'series'}
        className="absolute flex size-full gap-x-6"
      >
        {(!recentEpisodesQuery.data || recentEpisodesQuery.data.length === 0) && (
          <div className="flex size-full flex-col justify-center pb-10 text-center">
            No Recently Imported Episodes!
          </div>
        )}

        {map(
          recentEpisodesQuery.data,
          item => <EpisodeDetails episode={item} key={`${item.IDs.ShokoEpisode}-${item.IDs.ShokoFile}`} />,
        )}
      </TransitionDiv>

      <TransitionDiv
        show={recentlyImportedView === 'series'}
        className="absolute flex size-full gap-x-6"
      >
        {(!recentSeriesQuery.data || recentSeriesQuery.data.length === 0) && (
          <div className="flex size-full flex-col justify-center pb-10 text-center">
            No Recently Imported Series!
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
