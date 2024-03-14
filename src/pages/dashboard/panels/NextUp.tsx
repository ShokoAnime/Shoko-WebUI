import React from 'react';
import { useSelector } from 'react-redux';
import cx from 'classnames';

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
    >
      <div
        className={cx('shoko-scrollbar flex', nextUpQuery.data?.length === 0 && ('h-[calc(100%-3.5rem)]'))}
      >
        {(nextUpQuery.data?.length ?? 0) > 0
          ? nextUpQuery.data?.map(item => <EpisodeDetails episode={item} key={item.IDs.ID} />)
          : (
            <div className="flex w-full flex-col justify-center gap-y-2 text-center">
              <div>You&apos;ve Finished Every Series In Progress.</div>
              <div>Time For A New Series?</div>
            </div>
          )}
      </div>
    </ShokoPanel>
  );
};

export default NextUp;
