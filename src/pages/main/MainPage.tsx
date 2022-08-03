import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet } from 'react-router';
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import Sidebar from '../../components/Layout/Sidebar';

import ImportFolderModal from '../../components/Dialogs/ImportFolderModal';
import LanguagesModal from '../../components/Dialogs/LanguagesModal';
import ProfileModal from '../../components/Dialogs/ProfileModal';
import FiltersModal from '../../components/Dialogs/FiltersModal';

function MainPage() {
  const dispatch = useDispatch();

  const toastPosition = useSelector(
    (state: RootState) => state.webuiSettings.webui_v2.toastPosition,
  );
  const notifications = useSelector(
    (state: RootState) => state.webuiSettings.webui_v2.notifications,
  );

  useEffect(() => {
    dispatch({ type: Events.SETTINGS_GET_SERVER });
    dispatch({ type: Events.MAINPAGE_LOAD });
    dispatch({ type: Events.MAINPAGE_QUEUE_STATUS });
  }, []);

  return (
    <React.Fragment>
      {notifications && (
        <ToastContainer
          position={toastPosition}
          autoClose={4000}
          transition={Slide}
          bodyClassName="font-semibold font-open-sans"
          className="mt-20"
        />
      )}
      <div className="flex grow h-full">
        <ImportFolderModal />
        <LanguagesModal />
        <ProfileModal />
        <FiltersModal />
        <div className="flex">
          <Sidebar />
        </div>
        <div className="flex flex-col grow">
          <div className="overflow-y-auto grow">
            <Outlet />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default MainPage;
