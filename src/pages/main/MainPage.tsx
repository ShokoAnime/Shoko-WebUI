import React, { useEffect, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet } from 'react-router';
import { Slide, ToastContainer } from 'react-toastify';
import { Tooltip } from 'react-tooltip';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';

import ImportFolderModal from '@/components/Dialogs/ImportFolderModal';
import TopNav from '@/components/Layout/TopNav';
import Events from '@/core/events';
import { useSettingsQuery } from '@/core/react-query/settings/queries';

const MainPage = () => {
  const dispatch = useDispatch();

  const settingsQuery = useSettingsQuery();
  const { toastPosition } = settingsQuery.data.WebUI_Settings;

  // settingsQuery.isSuccess is always true due to the existence of initialData
  // settingsRevision will be 0 before the first actual fetch and it will never be 0 for fetched data
  // This is kind of a hack but it works
  const isSettingsLoaded = useMemo(
    () => settingsQuery.data.WebUI_Settings.settingsRevision > 0,
    [settingsQuery.data],
  );

  useEffect(() => {
    if (isSettingsLoaded) dispatch({ type: Events.MAINPAGE_LOADED });
  }, [dispatch, isSettingsLoaded]);

  const scrollRef = useRef<HTMLDivElement>(null);

  if (!isSettingsLoaded) {
    return (
      <div className="flex grow items-center justify-center text-panel-text-primary">
        <Icon path={mdiLoading} size={4} spin />
      </div>
    );
  }

  return (
    <>
      <ToastContainer
        position={toastPosition}
        autoClose={4000}
        transition={Slide}
        className="mt-32 w-118!"
        closeButton={false}
        icon={false}
      />
      <Tooltip
        id="tooltip"
        render={({ content }) => content}
        place="top-start"
        className="z-10000"
      />
      <div className="flex grow flex-col overflow-x-clip">
        <ImportFolderModal />
        <TopNav />
        <div className="scroll-gutter grow overflow-y-auto py-6 contain-strict" ref={scrollRef}>
          <div className="scroll-no-gutter mx-auto flex min-h-full w-full max-w-480 flex-col px-6">
            <Outlet context={{ scrollRef }} />
          </div>
        </div>
      </div>
    </>
  );
};

export default MainPage;
