import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet } from 'react-router';
import { useMediaQuery } from 'react-responsive';
import { Slide, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

import Events from '@/core/events';

import ImportFolderModal from '@/components/Dialogs/ImportFolderModal';
import LanguagesModal from '@/components/Dialogs/LanguagesModal';
import ProfileModal from '@/components/Dialogs/ProfileModal';
import FiltersModal from '@/components/Dialogs/FiltersModal';
import ActionsModal from '@/components/Dialogs/ActionsModal';
import UtilitiesModal from '@/components/Dialogs/UtilitiesModal';
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
          bodyClassName="font-semibold"
          className="mt-20 !w-96"
          closeButton={false}
          icon={false}
          hideProgressBar={true}
        />
      )}
      <div className="flex flex-col grow">
        <ImportFolderModal />
        <LanguagesModal />
        <ProfileModal />
        <FiltersModal />
        <ActionsModal />
        <UtilitiesModal />
        <TopNav />
        {isSm && (<Header showSidebar={showSmSidebar} setShowSidebar={setShowSmSidebar} />)}
        <div className="grow shoko-scrollbar overflow-y-auto" id="scrollContainer" ref={scrollRef}>
          <div className="max-w-[120rem] w-full h-full mx-auto" onClick={() => setShowSmSidebar(false)}>
            <Outlet context={{ scrollRef }} />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default MainPage;
