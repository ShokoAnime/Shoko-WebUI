import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet } from 'react-router';
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

import Events from '../../core/events';
import Sidebar from '../../components/Layout/Sidebar';

import ImportFolderModal from '../../components/Dialogs/ImportFolderModal';
import LanguagesModal from '../../components/Dialogs/LanguagesModal';
import ProfileModal from '../../components/Dialogs/ProfileModal';
import FiltersModal from '../../components/Dialogs/FiltersModal';
import ActionsModal from '../../components/Dialogs/ActionsModal';
import UtilitiesModal from '../../components/Dialogs/UtilitiesModal';

import { useGetSettingsQuery } from '../../core/rtkQuery/settingsApi';
import { initialSettings } from '../settings/SettingsPage';

function MainPage() {
  const dispatch = useDispatch();

  const settingsQuery = useGetSettingsQuery();
  const { toastPosition, notifications } = settingsQuery.data?.WebUI_Settings ?? initialSettings.WebUI_Settings;

  useEffect(() => {
    dispatch({ type: Events.MAINPAGE_LOAD });
  }, []);

  return (
    <React.Fragment>
      {notifications && (
        <ToastContainer
          position={toastPosition}
          autoClose={4000}
          transition={Slide}
          bodyClassName="font-semibold font-open-sans"
          className="mt-20 !w-96"
          closeButton={false}
          icon={false}
          hideProgressBar={true}
        />
      )}
      <div className="flex grow h-full">
        <ImportFolderModal />
        <LanguagesModal />
        <ProfileModal />
        <FiltersModal />
        <ActionsModal />
        <UtilitiesModal />
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
