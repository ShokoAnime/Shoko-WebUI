import { useEffect, useRef } from 'react';
import { Outlet } from 'react-router';
import { Tooltip } from 'react-tooltip';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';

import ManagedFolderModal from '@/components/Dialogs/ManagedFolderModal';
import TopNav from '@/components/Layout/TopNav';
import RestartNotice from '@/components/RestartNotice';
import ToastContainer from '@/components/ToastContainer';
import Events from '@/core/events';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import { useDispatch } from '@/core/store';
import useFreshCurrentUser from '@/hooks/useFreshCurrentUser';

const MainPage = () => {
  const dispatch = useDispatch();

  const settingsQuery = useSettingsQuery();
  const { toastPosition } = settingsQuery.data.WebUI_Settings;

  // settingsQuery.isSuccess is always true due to the existence of initialData
  // settingsRevision will be 0 before the first actual fetch and it will never be 0 for fetched data
  // This is kind of a hack but it works
  const isSettingsLoaded = settingsQuery.data.WebUI_Settings.settingsRevision > 0;

  // SignalR waits for the user, as only admins join the restart feed.
  const { isAdmin, isLoaded: isUserLoaded } = useFreshCurrentUser();

  useEffect(() => {
    if (isSettingsLoaded && isUserLoaded) dispatch({ type: Events.MAINPAGE_LOADED, payload: { isAdmin } });
  }, [dispatch, isAdmin, isSettingsLoaded, isUserLoaded]);

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
      <ToastContainer toastPosition={toastPosition} />
      <RestartNotice />
      <Tooltip
        id="tooltip"
        render={({ content }) => content}
        place="top-start"
        className="z-10000"
      />
      <div className="flex grow flex-col overflow-x-clip">
        <ManagedFolderModal />
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
