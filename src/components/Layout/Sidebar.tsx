import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import cx from 'classnames';
import { Icon } from '@mdi/react';
import {
  mdiServer,
  mdiCogOutline,
  mdiFormatListBulletedSquare,
  // mdiLayersTripleOutline,
  mdiTabletDashboard, mdiTextBoxOutline,
  mdiTools,
  mdiMagnify,
  mdiHelpCircleOutline,
  mdiGithub, mdiDownloadCircleOutline,
} from '@mdi/js';
import { siDiscord } from 'simple-icons/icons';

import { RootState } from '../../core/store';
import { setStatus as setActionsStatus } from '../../core/slices/modals/actions';
import { setStatus as setUtilitiesStatus } from '../../core/slices/modals/utilities';
import { default as ShokoIcon } from '../ShokoIcon';

import { useGetWebuiLatestMutation, useGetWebuiUpdateMutation } from '../../core/rtkQuery/webuiApi';
import { useGetSettingsQuery } from '../../core/rtkQuery/settingsApi';
import { initialSettings } from '../../pages/settings/SettingsPage';

import Version from '../../../public/version.json';
import toast from '../Toast';

function Sidebar() {
  const dispatch = useDispatch();

  const pathname = useSelector((state: RootState) => state.router.location.pathname);
  const queueItems = useSelector((state: RootState) => state.mainpage.queueStatus);
  const username = useSelector((state: RootState) => state.apiSession.username);

  const utilitiesModalOpen = useSelector((state: RootState) => state.modals.utilities.status);
  const actionsModalOpen = useSelector((state: RootState) => state.modals.actions.status);

  const settingsQuery = useGetSettingsQuery();
  const webuiSettings = settingsQuery?.data?.WebUI_Settings ?? initialSettings.WebUI_Settings;

  const [checkWebuiUpdateTrigger] = useGetWebuiLatestMutation();
  const [webuiUpdateTrigger] = useGetWebuiUpdateMutation();

  const [webuiUpdateAvailable, setWebuiUpdateAvailable] = useState(false);

  useEffect(() => {
    checkWebuiUpdateTrigger(webuiSettings.updateChannel ?? 'stable').unwrap().then((result) => {
      setWebuiUpdateAvailable(!Version.debug && result.version !== Version.package);
    }, reason => console.error(reason));
  }, []);

  const renderNonLinkMenuItem = (key: string, text: string, icon: string, onClick: () => void, modalOpen = false) => {
    const uri = `/webui/${key}`;
    const isHighlighted = pathname.startsWith(uri) || modalOpen;
    return (
      <div key={key} className={cx(['cursor-pointer flex items-center w-full px-7', isHighlighted && 'text-highlight-1'])} onClick={onClick}>
        <div className="w-6 flex items-center mr-6 my-3"><Icon path={icon} size={1} horizontal vertical rotate={180}/></div>
        <span className="text-lg">{text}</span>
      </div>
    );
  };

  const renderMenuItem = (key: string, text: string, icon: string) => {
    const uri = `/webui/${key}`;
    const isHighlighted = pathname.startsWith(uri);
    return (
      <Link key={key} className={cx(['cursor-pointer flex items-center w-full px-7', isHighlighted && 'text-highlight-1'])} to={uri}>
        <div className="w-6 flex items-center mr-6 my-3"><Icon path={icon} size={1} horizontal vertical rotate={180}/></div>
        <span className="text-lg">{text}</span>
      </Link>
    );
  };

  const renderMenuLink = (url: string, icon: string) => (
      <div key={icon} className="cursor-pointer w-6 flex items-center" onClick={() => window.open(url, '_blank')}><Icon path={icon} size={1} horizontal vertical rotate={180} /></div>
  );

  return (
    <div className="flex flex-col grow items-center h-screen bg-background-nav overflow-y-auto w-62.5 box-border font-semibold drop-shadow-[4px_0_4px_rgba(0,0,0,0.25)]">
      <div className="flex flex-col p-10">
        <ShokoIcon/>
      </div>
      <div className="flex items-center w-full p-4">
        <div className="flex items-center justify-center bg-highlight-1/75 hover:bg-highlight-1 w-15 h-15 text-xl rounded-full">
          {username.charAt(0)}
        </div>
        <div className="flex flex-col ml-3">
          <div className="opacity-75">Welcome Back</div>
          <div className="flex">{username}</div>
        </div>
      </div>
      <div className="flex mt-10 w-full bg-background-alt px-7 py-4 items-center border-y border-background-border">
        <Icon path={mdiMagnify} size={1} horizontal vertical rotate={180} />
        <span className="font-semibold">Search...</span>
      </div>
      <div className="flex items-center mt-11 w-full px-7">
        <div className="w-6 flex items-center mr-6"><Icon path={mdiServer} size={1} horizontal vertical rotate={180} /></div>
        <span className="text-highlight-2 text-lg">{(queueItems.HasherQueueCount + queueItems.GeneralQueueCount + queueItems.ImageQueueCount) ?? 0}</span>
      </div>
      <div className="flex flex-col justify-between mt-11 w-full">
        {renderMenuItem('dashboard', 'Dashboard', mdiTabletDashboard)}
        {/*{renderMenuItem('collection', 'Collection', mdiLayersTripleOutline)}*/}
        {renderNonLinkMenuItem('utilities', 'Utilities', mdiTools, () => dispatch(setUtilitiesStatus(!utilitiesModalOpen)), utilitiesModalOpen)}
        {renderNonLinkMenuItem('actions', 'Actions', mdiFormatListBulletedSquare, () => dispatch(setActionsStatus(!actionsModalOpen)), actionsModalOpen)}
        {renderMenuItem('log', 'Log', mdiTextBoxOutline)}
        {renderMenuItem('settings', 'Settings', mdiCogOutline)}
        <div className="flex flex-col mt-10 px-7">
          {/*<div className="flex items-center font-semibold cursor-pointer">*/}
          {/*  <Icon path={mdiDownloadCircleOutline} size={1} className="text-highlight-2"/>*/}
          {/*  <div className="flex flex-col ml-3">*/}
          {/*    <span>Server</span>Update Available*/}
          {/*  </div>*/}
          {/*</div>*/}
          {webuiUpdateAvailable && (
            <div className="flex items-center font-semibold cursor-pointer mt-5" onClick={() => webuiUpdateTrigger(webuiSettings.updateChannel ?? 'stable').unwrap().then(() => toast.success('Update Successful!', 'Please close this and open another tab to use the Web UI', { autoClose: 5000 }))}>
              <Icon path={mdiDownloadCircleOutline} size={1} className="text-highlight-2"/>
              <div className="flex flex-col ml-3">
                <span>Web UI</span>Update Available
              </div>
            </div>
          )}
          {/*<div className="flex items-center font-semibold cursor-pointer mt-5">*/}
          {/*  <Icon path={mdiInformationOutline} size={1} className="text-highlight-4"/>*/}
          {/*  <div className="flex flex-col ml-3">*/}
          {/*    <span>AniDB</span>Ban Detected!*/}
          {/*  </div>*/}
          {/*</div>*/}
        </div>
      </div>
      <div className="flex justify-between w-full self-end px-6 mt-auto py-6">
        {renderMenuLink('https://discord.gg/vpeHDsg', siDiscord.path)}
        {renderMenuLink('https://docs.shokoanime.com', mdiHelpCircleOutline)}
        {renderMenuLink('https://github.com/ShokoAnime', mdiGithub)}
      </div>
    </div>
  );
}

export default Sidebar;
