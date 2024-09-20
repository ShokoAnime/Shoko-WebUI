import React from 'react';
import { useSelector } from 'react-redux';
import { map } from 'lodash';

import ShokoPanel from '@/components/Panels/ShokoPanel';
import { useDashboardNextUpQuery } from '@/core/react-query/dashboard/queries';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import EpisodeDetails from '@/pages/dashboard/components/EpisodeDetails';

import type { RootState } from '@/core/store';

const NextUp = () => {
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const { combineContinueWatching, hideR18Content } = useSettingsQuery().data.WebUI_Settings.dashboard;

  const nextUpQuery = useDashboardNextUpQuery({
    includeRestricted: !hideR18Content,
    onlyUnwatched: !combineContinueWatching,
    pageSize: 20,
  });

  return (
    <ShokoPanel
      title={combineContinueWatching ? 'Continue Watching' : 'Next Up'}
      isFetching={nextUpQuery.isPending}
      editMode={layoutEditMode}
      contentClassName="!flex-row gap-x-6"
    >
      {(!nextUpQuery.data || nextUpQuery.data.length === 0) && (
        <div className="flex size-full flex-col justify-center gap-y-2 pb-10 text-center">
          <div>No Episodes In Progress.</div>
          <div>Stop An Episode During Playback To Populate This Section.</div>
        </div>
      )}

      {map(
        nextUpQuery.data,
        item => <EpisodeDetails episode={item} key={item.IDs.ID} />,
      )}
    </ShokoPanel>
  );
};

export default NextUp;
