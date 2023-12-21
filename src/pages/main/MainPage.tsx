import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import { Outlet } from 'react-router';
import { Slide, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

import ImportFolderModal from '@/components/Dialogs/ImportFolderModal';
import ProfileModal from '@/components/Dialogs/ProfileModal';
import Header from '@/components/Layout/Header';
import TopNav from '@/components/Layout/TopNav';
import Events from '@/core/events';
import { useSettingsQuery } from '@/core/react-query/settings/queries';

function MainPage() {
  const dispatch = useDispatch();

  const isSm = useMediaQuery({ minWidth: 0, maxWidth: 767 });

  const { notifications, toastPosition } = useSettingsQuery().data.WebUI_Settings;

  const [showSmSidebar, setShowSmSidebar] = useState(false);

  useEffect(() => {
    dispatch({ type: Events.MAINPAGE_LOAD });
  }, [dispatch]);

  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {notifications && (
        <ToastContainer
          position={toastPosition}
          autoClose={4000}
          transition={Slide}
          className="mt-20 !w-[29.5rem]"
          closeButton={false}
          icon={false}
        />
      )}
      <div className="flex grow flex-col overflow-x-clip">
        <ImportFolderModal />
        <ProfileModal />
        <TopNav />
        {isSm && <Header showSidebar={showSmSidebar} setShowSidebar={setShowSmSidebar} />}
        <div className="shoko-scrollbar scroll-gutter grow overflow-y-auto py-8" ref={scrollRef}>
          <div
            className="scroll-no-gutter mx-auto flex min-h-full w-full max-w-[120rem] flex-col px-8"
            onClick={() => setShowSmSidebar(false)}
          >
            <Outlet context={{ scrollRef }} />
          </div>
        </div>
      </div>
    </>
  );
}

export default MainPage;
