import React from 'react';
import { useSelector } from 'react-redux';
import cx from 'classnames';

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
    <ShokoPanel title="Continue Watching" isFetching={continueWatchingQuery.isPending} editMode={layoutEditMode}>
      <div
        className={cx('shoko-scrollbar flex', continueWatchingQuery.data?.length === 0 && ('h-full pb-[3.5rem]'))}
      >
        {(continueWatchingQuery.data?.length ?? 0) > 0
          ? continueWatchingQuery.data?.map(item => <EpisodeDetails episode={item} key={item.IDs.ID} />)
          : (
            <div className="flex size-full grow flex-col items-center justify-center gap-y-2 text-center">
              <div>No Episodes In Progress.</div>
              <div>Stop An Episode During Playback To Populate This Section.</div>
            </div>
          )}
      </div>
    </ShokoPanel>
  );
};

export default ContinueWatching;
