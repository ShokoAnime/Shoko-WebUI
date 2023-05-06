import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Icon } from '@mdi/react';
import {
  mdiChevronDown,
  mdiCogOutline,
  mdiDownloadCircleOutline,
  mdiFormatListBulletedSquare,
  mdiGithub,
  mdiHelpCircleOutline,
  mdiInformationOutline,
  mdiLayersTripleOutline,
  mdiLoading,
  mdiServer,
  mdiTabletDashboard,
  mdiTextBoxOutline,
  mdiTools,
} from '@mdi/js';

import ShokoIcon from '../ShokoIcon';

import { RootState } from '../../core/store';
import cx from 'classnames';
import { Link } from 'react-router-dom';
import { setLayoutEditMode } from '../../core/slices/mainpage';
import { setStatus as setUtilitiesStatus } from '../../core/slices/modals/utilities';
import { setStatus as setActionsStatus } from '../../core/slices/modals/actions';
import { siDiscord } from 'simple-icons/icons';
import semver from 'semver';
import Version from '../../../public/version.json';
import { useGetWebuiUpdateCheckQuery, useGetWebuiUpdateMutation } from '../../core/rtkQuery/splitV3Api/webuiApi';
import { useGetSettingsQuery } from '../../core/rtkQuery/splitV3Api/settingsApi';
import { initialSettings } from '../../pages/settings/SettingsPage';
import Button from '../Input/Button';
import toast from '../Toast';
import { push } from '@lagunovsky/redux-react-router';

function TopNav() {
  const dispatch = useDispatch();
  
  const queueItems = useSelector((state: RootState) => state.mainpage.queueStatus);
  const username = useSelector((state: RootState) => state.apiSession.username);
  const pathname = useSelector((state: RootState) => state.router.location.pathname);
  const banStatus = useSelector((state: RootState) => state.mainpage.banStatus);
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const utilitiesModalOpen = useSelector((state: RootState) => state.modals.utilities.status);
  const actionsModalOpen = useSelector((state: RootState) => state.modals.actions.status);

  const settingsQuery = useGetSettingsQuery();
  const webuiSettings = settingsQuery?.data?.WebUI_Settings ?? initialSettings.WebUI_Settings;

  const checkWebuiUpdate = useGetWebuiUpdateCheckQuery(webuiSettings.updateChannel, { skip: Version.debug || !settingsQuery.isSuccess });
  const [webuiUpdateTrigger, webuiUpdateResult] = useGetWebuiUpdateMutation();

  const closeModalsAndSidebar = () => {
    dispatch(setUtilitiesStatus(false));
    dispatch(setActionsStatus(false));
  };

  const toggleModal = (modal: string) => {
    closeModalsAndSidebar();
    switch (modal) {
      case 'utilities':
        dispatch(setUtilitiesStatus(!utilitiesModalOpen));
        return;
      case 'actions':
        dispatch(setActionsStatus(!actionsModalOpen));
        return;
    }
  };

  const handleWebUiUpdate = () => {
    const renderToast = () => (
      <div className="flex flex-col">
        WebUI Update Successful!
        <div className="flex items-center justify-end mt-3">
          <Button onClick={() => {
            toast.dismiss('webui-update');
            dispatch(push('/webui/dashboard'));
            setTimeout(() => window.location.reload(), 100);
          }} className="bg-highlight-1 py-1.5 w-full">
            Click here to reload
          </Button>
        </div>
      </div>
    );

    webuiUpdateTrigger(webuiSettings.updateChannel).unwrap().then(() => {
      toast.success('', renderToast(), {
        autoClose: false,
        draggable: false,
        closeOnClick: false,
        toastId: 'webui-update',
        className: 'w-72 ml-auto',
      });
    }, error => console.error(error));
  };

  const renderNonLinkMenuItem = (key: string, text: string, icon: string, onClick: () => void, modalOpen = false) => {
    const uri = `/webui/${key}`;
    const isHighlighted = pathname.startsWith(uri) || modalOpen;
    return (
      <div key={key} className={cx(['cursor-pointer flex items-center', isHighlighted && 'text-highlight-1'])} onClick={onClick}>
        <Icon path={icon} size={1} className="mr-2.5" />
        {text}
      </div>
    );
  };

  const renderMenuItem = (key: string, text: string, icon: string) => {
    const uri = `/webui/${key}`;
    const isHighlighted = pathname.startsWith(uri);
    return (
      <div className="flex items-center justify-between">
        <Link key={key} className={cx(['flex items-center', isHighlighted && 'text-highlight-1'])} to={uri} onClick={() => closeModalsAndSidebar()}>
          <Icon path={icon} size={1} className="mr-2.5" />
          {text}
        </Link>
      </div>
    );
  };

  const renderMenuLink = (url: string, icon: string) => (
    <a href={url} key={icon} target="_blank" rel="noreferrer noopener">
      <Icon path={icon} size={1} />
    </a>
  );

  return (
    <div className="flex flex-col bg-background-alt drop-shadow-[0_2px_2px_rgba(0,0,0,0.25)] z-[100] text-sm font-semibold">
      <div className="flex justify-between px-8 py-6 items-center max-w-[120rem] w-full mx-auto">
        <div className="flex items-center space-x-2">
          <ShokoIcon className="w-6" />
          <span className="text-xl font-semibold mt-1">Shoko</span>
        </div>
        <div className="flex items-center space-x-8">
          <div className="flex items-center">
            <Icon path={mdiServer} size={1} />
            <span className="ml-2  text-highlight-2">{(queueItems.HasherQueueCount + queueItems.GeneralQueueCount + queueItems.ImageQueueCount) ?? 0}</span>
          </div>
          <div className="flex items-center">
            <div className="flex items-center justify-center bg-highlight-1/75 hover:bg-highlight-1 w-8 h-8 text-xl rounded-full mr-3">
              {username.charAt(0)}
            </div>
            <span>{username}</span>
            <Icon className="ml-2" path={mdiChevronDown} size={1} />
          </div>
          <Link className={cx(['cursor-pointer', pathname.startsWith('/webui/settings') && 'text-highlight-1'])} to="/webui/settings" onClick={() => closeModalsAndSidebar()}>
            <Icon path={mdiCogOutline} size={1} />
          </Link>
        </div>
      </div>
      <div className="bg-background-nav">
        <div className="flex justify-between px-8 py-4 max-w-[120rem] w-full mx-auto">
          <div className="flex">
            {renderMenuItem('dashboard', 'Dashboard', mdiTabletDashboard)}
            <div className={cx('transition-opacity flex ml-8 space-x-8', layoutEditMode && 'opacity-50 pointer-events-none')}>
              {renderMenuItem('collection', 'Collection', mdiLayersTripleOutline)}
              {renderNonLinkMenuItem('utilities', 'Utilities', mdiTools, () => toggleModal('utilities'), utilitiesModalOpen)}
              {renderNonLinkMenuItem('actions', 'Actions', mdiFormatListBulletedSquare, () => toggleModal('actions'), actionsModalOpen)}
              {renderMenuItem('log', 'Log', mdiTextBoxOutline)}
            </div>
          </div>
          <div className="flex gap-8 justify-end">
            {pathname === '/webui/dashboard' && renderNonLinkMenuItem('dashboard-settings', 'Dashboard Settings', mdiTabletDashboard, () => dispatch(setLayoutEditMode(true)), layoutEditMode)}
            {((checkWebuiUpdate.isSuccess && semver.gt(checkWebuiUpdate.data.Version, Version.package)) || checkWebuiUpdate.isFetching) && !webuiUpdateResult.isSuccess && (
              <div className="flex items-center font-semibold cursor-pointer" onClick={() => handleWebUiUpdate()}>
                <Icon
                  path={checkWebuiUpdate.isFetching || webuiUpdateResult.isLoading ? mdiLoading : mdiDownloadCircleOutline}
                  size={1}
                  className={checkWebuiUpdate.isFetching || webuiUpdateResult.isLoading ? 'text-highlight-1' : 'text-highlight-2'}
                  spin={checkWebuiUpdate.isFetching || webuiUpdateResult.isLoading}
                />
                <div className="flex ml-2.5">
                  Web UI {webuiUpdateResult.isLoading ? 'Updating...' : (checkWebuiUpdate.isFetching ? 'Checking for update' : 'Update Available')}
                </div>
              </div>
            )}
            {/*TODO: This maybe works, maybe doesn't. Cannot test properly.*/}
            {(banStatus?.udp?.updateType === 1 && banStatus?.udp?.value) && (
              <div className="flex items-center font-semibold cursor-pointer">
                <Icon path={mdiInformationOutline} size={1} className="text-highlight-4 mr-2.5"/>
                AniDB UDP Ban Detected!
              </div>
            )}
            {(banStatus?.http?.updateType === 2 && banStatus?.http?.value) && (
              <div className="flex items-center font-semibold cursor-pointer">
                <Icon path={mdiInformationOutline} size={1} className="text-highlight-4 mr-2.5"/>
                AniDB HTTP Ban Detected!
              </div>
            )}
            <div className="flex gap-5">
              {renderMenuLink('https://discord.gg/vpeHDsg', siDiscord.path)}
              {renderMenuLink('https://docs.shokoanime.com', mdiHelpCircleOutline)}
              {renderMenuLink('https://github.com/ShokoAnime', mdiGithub)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopNav;
