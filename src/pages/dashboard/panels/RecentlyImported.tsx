import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import ShokoPanel from '@/components/Panels/ShokoPanel';
import TransitionDiv from '@/components/TransitionDiv';
import {
  useDashboardRecentlyAddedEpisodesQuery,
  useDashboardRecentlyAddedSeriesQuery,
} from '@/core/react-query/dashboard/queries';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import DashboardTitleToggle from '@/pages/dashboard/components/DashboardTitleToggle';
import EpisodeDetails from '@/pages/dashboard/components/EpisodeDetails';
import SeriesDetails from '@/pages/dashboard/components/SeriesDetails';

import type { RootState } from '@/core/store';

const RecentlyImported = () => {
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const {
    hideR18Content,
    recentlyImportedEpisodesCount,
    recentlyImportedSeriesCount,
  } = useSettingsQuery().data.WebUI_Settings.dashboard;

  const [showSeries, setShowSeries] = useState(false);
  const recentSeriesQuery = useDashboardRecentlyAddedSeriesQuery({
    includeRestricted: !hideR18Content,
    pageSize: recentlyImportedSeriesCount,
  });
  const recentEpisodesQuery = useDashboardRecentlyAddedEpisodesQuery({
    includeRestricted: !hideR18Content,
    pageSize: recentlyImportedEpisodesCount,
  });

  return (
    <ShokoPanel
      title="Recently Imported"
      editMode={layoutEditMode}
      isFetching={showSeries ? recentSeriesQuery.isPending : recentEpisodesQuery.isPending}
      options={
        <DashboardTitleToggle
          mainTitle="Episodes"
          secondaryTitle="Series"
          secondaryActive={showSeries}
          setSecondaryActive={setShowSeries}
        />
      }
    >
      <div className="shoko-scrollbar relative mb-6 flex grow items-center">
        <TransitionDiv show={!showSeries} className="absolute flex w-full">
          {(recentEpisodesQuery.data?.length ?? 0) > 0
            ? recentEpisodesQuery.data?.map(item => (
              <EpisodeDetails episode={item} key={`${item.IDs.ShokoEpisode}-${item.IDs.ShokoFile}`} />
            ))
            : <div className="flex w-full justify-center font-semibold">No Recently Imported Episodes!</div>}
        </TransitionDiv>
        <TransitionDiv show={showSeries} className="absolute flex w-full">
          {(recentSeriesQuery.data?.length ?? 0) > 0
            ? recentSeriesQuery.data?.map(item => <SeriesDetails series={item} key={item.IDs.ID} />)
            : <div className="flex w-full justify-center font-semibold">No Recently Imported Series!</div>}
        </TransitionDiv>
      </div>
    </ShokoPanel>
  );
};

export default RecentlyImported;
