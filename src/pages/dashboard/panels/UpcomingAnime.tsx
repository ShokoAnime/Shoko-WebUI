import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import ShokoPanel from '@/components/Panels/ShokoPanel';
import TransitionDiv from '@/components/TransitionDiv';
import { useDashboardCalendarQuery } from '@/core/react-query/dashboard/queries';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import DashboardTitleToggle from '@/pages/dashboard/components/DashboardTitleToggle';
import EpisodeDetails from '@/pages/dashboard/components/EpisodeDetails';
import { initialSettings } from '@/pages/settings/SettingsPage';

import type { RootState } from '@/core/store';

const UpcomingAnime = () => {
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const [showAll, setShowAll] = useState(false);

  const settingsQuery = useSettingsQuery();
  const settings = useMemo(() => settingsQuery.data ?? initialSettings, [settingsQuery]);
  const { hideR18Content } = settings.WebUI_Settings.dashboard;

  const localItems = useDashboardCalendarQuery({ showAll: false, includeRestricted: !hideR18Content });
  const items = useDashboardCalendarQuery({ showAll: true, includeRestricted: !hideR18Content });

  return (
    <ShokoPanel
      title="Upcoming Anime"
      editMode={layoutEditMode}
      isFetching={showAll ? items.isLoading : localItems.isLoading}
      options={
        <DashboardTitleToggle
          mainTitle="My Collection"
          secondaryTitle="All"
          secondaryActive={showAll}
          setSecondaryActive={setShowAll}
        />
      }
    >
      <div className="shoko-scrollbar relative flex">
        <TransitionDiv show={!showAll} className="absolute flex w-full">
          {(localItems.data?.length ?? 0) > 0
            ? localItems.data?.map(item => <EpisodeDetails episode={item} showDate key={item.IDs.ID} />)
            : (
              <div className="mt-4 flex w-full flex-col justify-center gap-y-2 text-center">
                <div>No Upcoming Anime.</div>
                <div>Start A Currently Airing Series To Populate This Section.</div>
              </div>
            )}
        </TransitionDiv>
        <TransitionDiv show={showAll} className="absolute flex w-full">
          {(items.data?.length ?? 0) > 0
            ? items.data?.map(item => (
              <EpisodeDetails
                episode={item}
                showDate
                key={item.IDs.ID}
                isInCollection={item.IDs.ShokoSeries !== null}
              />
            ))
            : (
              <div className="mt-4 flex w-full flex-col justify-center gap-y-2 text-center">
                <div>No Upcoming Anime.</div>
                <div>Enable Calendar To Populate This Section</div>
              </div>
            )}
        </TransitionDiv>
      </div>
    </ShokoPanel>
  );
};

export default UpcomingAnime;
