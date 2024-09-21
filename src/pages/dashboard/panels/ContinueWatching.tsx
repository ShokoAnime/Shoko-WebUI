import React from 'react';
import { useSelector } from 'react-redux';
import { map } from 'lodash';

import ShokoPanel from '@/components/Panels/ShokoPanel';
import { useDashboardContinueWatchingQuery } from '@/core/react-query/dashboard/queries';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import EpisodeDetails from '@/pages/dashboard/components/EpisodeDetails';

import type { RootState } from '@/core/store';

const ContinueWatching = () => {
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const { hideR18Content } = useSettingsQuery().data.WebUI_Settings.dashboard;

  const continueWatchingQuery = useDashboardContinueWatchingQuery({ includeRestricted: !hideR18Content, pageSize: 20 });

  return (
    <ShokoPanel
      title="Continue Watching"
      isFetching={continueWatchingQuery.isPending}
      editMode={layoutEditMode}
      contentClassName="!flex-row gap-x-6"
    >
      {(!continueWatchingQuery.data || continueWatchingQuery.data.length === 0) && (
        <div className="flex size-full flex-col justify-center gap-y-2 pb-10 text-center">
          <div>No Episodes In Progress.</div>
          <div>Stop An Episode During Playback To Populate This Section.</div>
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
