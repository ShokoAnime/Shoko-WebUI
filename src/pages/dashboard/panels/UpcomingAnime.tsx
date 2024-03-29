import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import cx from 'classnames';

import ShokoPanel from '@/components/Panels/ShokoPanel';
import TransitionDiv from '@/components/TransitionDiv';
import { useDashboardCalendarQuery } from '@/core/react-query/dashboard/queries';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import DashboardTitleToggle from '@/pages/dashboard/components/DashboardTitleToggle';
import EpisodeDetails from '@/pages/dashboard/components/EpisodeDetails';

import type { RootState } from '@/core/store';

const UpcomingAnime = () => {
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const [showAll, setShowAll] = useState(false);

  const { hideR18Content } = useSettingsQuery().data.WebUI_Settings.dashboard;

  const calendarQuery = useDashboardCalendarQuery({ showAll: false, includeRestricted: !hideR18Content });
  const calendarAllQuery = useDashboardCalendarQuery({ showAll: true, includeRestricted: !hideR18Content });

  return (
    <ShokoPanel
      title="Upcoming Anime"
      editMode={layoutEditMode}
      isFetching={showAll ? calendarAllQuery.isPending : calendarQuery.isPending}
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
          {(calendarQuery.data?.length ?? 0) > 0
            ? calendarQuery.data?.map(item => <EpisodeDetails episode={item} showDate key={item.IDs.ID} />)
            : (
              <div className="flex w-full flex-col justify-center gap-y-2 text-center">
                <div>No Upcoming Anime.</div>
                <div>Start A Currently Airing Series To Populate This Section.</div>
              </div>
            )}
        </TransitionDiv>
        <TransitionDiv
          show={showAll}
          className={cx('shoko-scrollbar flex', calendarAllQuery.data?.length === 0 && ('h-full pb-[3.5rem]'))}
        >
          {(calendarAllQuery.data?.length ?? 0) > 0
            ? calendarAllQuery.data?.map(item => (
              <EpisodeDetails
                episode={item}
                showDate
                key={item.IDs.ID}
                isInCollection={item.IDs.ShokoSeries !== null}
              />
            ))
            : (
              <div className="flex w-full flex-col justify-center gap-y-2 text-center">
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
