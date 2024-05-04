import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet } from 'react-router';
import { Slide, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

import ImportFolderModal from '@/components/Dialogs/ImportFolderModal';
import TopNav from '@/components/Layout/TopNav';
import Events from '@/core/events';
import { useSettingsQuery } from '@/core/react-query/settings/queries';

function MainPage() {
  const dispatch = useDispatch();

  const { notifications, toastPosition } = useSettingsQuery().data.WebUI_Settings;

  useEffect(() => {
    dispatch({ type: Events.MAINPAGE_LOADED });
  }, [dispatch]);

  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {notifications && (
        <ToastContainer
          position={toastPosition}
          autoClose={4000}
          transition={Slide}
          className="mt-32 !w-[29.5rem]"
          closeButton={false}
          icon={false}
        />
      )}
      <div className="flex grow flex-col overflow-x-clip">
        <ImportFolderModal />
        <TopNav />
        <div className="shoko-scrollbar scroll-gutter grow overflow-y-auto py-6" ref={scrollRef}>
          <div className="scroll-no-gutter mx-auto flex min-h-full w-full max-w-[120rem] flex-col px-6">
            <Outlet context={{ scrollRef }} />
          </div>
        </div>
      </div>
    </>
  );
}

export default MainPage;
