import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet } from 'react-router';
import { useMediaQuery } from 'react-responsive';
import { Slide, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

import Events from '@/core/events';

import ImportFolderModal from '@/components/Dialogs/ImportFolderModal';
import ProfileModal from '@/components/Dialogs/ProfileModal';
import FiltersModal from '@/components/Dialogs/FiltersModal';
import Header from '@/components/Layout/Header';
import TopNav from '@/components/Layout/TopNav';

import { useGetSettingsQuery } from '@/core/rtkQuery/splitV3Api/settingsApi';
import { initialSettings } from '../settings/SettingsPage';

function MainPage() {
  const dispatch = useDispatch();

  const isSm = useMediaQuery({ minWidth: 0, maxWidth: 767 });

  const settingsQuery = useGetSettingsQuery();
  const { toastPosition, notifications } = settingsQuery.data?.WebUI_Settings ?? initialSettings.WebUI_Settings;

  const [showSmSidebar, setShowSmSidebar] = useState(false);

  useEffect(() => {
    dispatch({ type: Events.MAINPAGE_LOAD });
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <React.Fragment>
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
      <div className="flex flex-col grow overflow-x-clip">
        <ImportFolderModal />
        <ProfileModal />
        <FiltersModal />
        <TopNav />
        {isSm && (<Header showSidebar={showSmSidebar} setShowSidebar={setShowSmSidebar} />)}
        <div className="grow shoko-scrollbar overflow-y-auto py-8 scroll-gutter" ref={scrollRef}>
          <div className="max-w-[120rem] w-full mx-auto px-8 min-h-full flex flex-col scroll-no-gutter" onClick={() => setShowSmSidebar(false)}>
            <Outlet context={{ scrollRef }} />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default MainPage;
