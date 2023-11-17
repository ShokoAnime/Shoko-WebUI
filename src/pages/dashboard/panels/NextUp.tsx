import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import ShokoPanel from '@/components/Panels/ShokoPanel';
import { useGetDashboardNextUpEpisodesQuery } from '@/core/rtkQuery/splitV3Api/dashboardApi';
import { useGetSettingsQuery } from '@/core/rtkQuery/splitV3Api/settingsApi';
import EpisodeDetails from '@/pages/dashboard/components/EpisodeDetails';
import { initialSettings } from '@/pages/settings/SettingsPage';

import type { RootState } from '@/core/store';

const NextUp = () => {
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const settingsQuery = useGetSettingsQuery();
  const { combineContinueWatching, hideR18Content } = useMemo(
    () => settingsQuery.data?.WebUI_Settings.dashboard ?? initialSettings.WebUI_Settings.dashboard,
    [settingsQuery],
  );

  const items = useGetDashboardNextUpEpisodesQuery({
    includeRestricted: !hideR18Content,
    onlyUnwatched: !combineContinueWatching,
    pageSize: 20,
  });

  return (
    <ShokoPanel
      title={combineContinueWatching ? 'Continue Watching' : 'Next Up'}
      isFetching={items.isLoading}
      editMode={layoutEditMode}
    >
      <div className="shoko-scrollbar flex">
        {(items.data?.length ?? 0) > 0
          ? items.data?.map(item => <EpisodeDetails episode={item} key={item.IDs.ID} />)
          : (
            <div className="mt-4 flex w-full flex-col justify-center gap-y-2 text-center">
              <div>You&apos;ve Finished Every Series In Progress.</div>
              <div>Time For A New Series?</div>
            </div>
          )}
      </div>
    </ShokoPanel>
  );
};

export default NextUp;
