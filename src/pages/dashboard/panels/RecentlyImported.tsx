import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import ShokoPanel from '@/components/Panels/ShokoPanel';
import TransitionDiv from '@/components/TransitionDiv';
import {
  useGetDashboardRecentlyAddedEpisodesQuery,
  useGetDashboardRecentlyAddedSeriesQuery,
} from '@/core/rtkQuery/splitV3Api/dashboardApi';
import { useGetSettingsQuery } from '@/core/rtkQuery/splitV3Api/settingsApi';
import DashboardTitleToggle from '@/pages/dashboard/components/DashboardTitleToggle';
import EpisodeDetails from '@/pages/dashboard/components/EpisodeDetails';
import SeriesDetails from '@/pages/dashboard/components/SeriesDetails';
import { initialSettings } from '@/pages/settings/SettingsPage';

import type { RootState } from '@/core/store';

const RecentlyImported = () => {
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const settingsQuery = useGetSettingsQuery();
  const { hideR18Content, recentlyImportedEpisodesCount, recentlyImportedSeriesCount } = useMemo(
    () => settingsQuery.data?.WebUI_Settings.dashboard ?? initialSettings.WebUI_Settings.dashboard,
    [settingsQuery],
  );

  const [showSeries, setShowSeries] = useState(false);
  const series = useGetDashboardRecentlyAddedSeriesQuery({
    includeRestricted: !hideR18Content,
    pageSize: recentlyImportedSeriesCount,
  });
  const episodes = useGetDashboardRecentlyAddedEpisodesQuery({
    includeRestricted: !hideR18Content,
    pageSize: recentlyImportedEpisodesCount,
  });

  const isLoading = useMemo(() => {
    if (showSeries) return series.isUninitialized || series.isLoading;
    return episodes.isUninitialized || episodes.isLoading;
  }, [episodes, series, showSeries]);

  return (
    <ShokoPanel
      title="Recently Imported"
      editMode={layoutEditMode}
      isFetching={isLoading}
      options={
        <DashboardTitleToggle
          mainTitle="Episodes"
          secondaryTitle="Series"
          secondaryActive={showSeries}
          setSecondaryActive={setShowSeries}
        />
      }
    >
      <div className="shoko-scrollbar relative flex">
        <TransitionDiv show={!showSeries} className="absolute flex">
          {(episodes.data?.length ?? 0) > 0
            ? episodes.data?.map(item => (
              <EpisodeDetails episode={item} key={`${item.IDs.ShokoEpisode}-${item.IDs.ShokoFile}`} />
            ))
            : <div className="mt-4 flex w-full justify-center font-semibold">No Recently Imported Episodes!</div>}
        </TransitionDiv>
        <TransitionDiv show={showSeries} className="absolute flex">
          {(series.data?.length ?? 0) > 0
            ? series.data?.map(item => <SeriesDetails series={item} key={item.IDs.ID} />)
            : <div className="mt-4 flex w-full justify-center font-semibold">No Recently Imported Series!</div>}
        </TransitionDiv>
      </div>
    </ShokoPanel>
  );
};

export default RecentlyImported;
