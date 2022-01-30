import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import cx from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTachometerAlt, faFolderOpen, faListAlt, faSlidersH, faQuestionCircle, faFileAlt,
  faServer, faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons';
import { faDiscord, faGithubSquare } from '@fortawesome/free-brands-svg-icons';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import { setStatus } from '../../core/slices/modals/profile';
import Button from '../Input/Button';
import { Icon } from '@mdi/react';
import {
  mdiCogOutline,
  mdiFormatListBulletedSquare,
  mdiLayersTripleOutline,
  mdiTabletDashboard, mdiTextBoxOutline,
  mdiTools,
  mdiFolder,
  mdiMagnify,
  mdiDiscord,
  mdiHelpCircleOutline,
  mdiGithub
} from '@mdi/js';

function Sidebar() {
  const dispatch = useDispatch();

  const pathname = useSelector((state: RootState) => state.router.location.pathname);
  const queueItems = useSelector((state: RootState) => state.mainpage.queueStatus);
  const username = useSelector((state: RootState) => state.apiSession.username);

  useEffect(() => {
    dispatch(setStatus(false));
  }, []);

  const renderItem = (key: string, text: string, icon: IconProp) => (
    <Button key={key} className={cx(['flex items-center sidebar-item mt-8 first:mt-12', pathname === `/${key}` && 'color-highlight-1'])} onClick={() => dispatch(push(key))}>
      <FontAwesomeIcon icon={icon} className="text-xl2" title={text} />
    </Button>
  );

  const renderLink = (url: string, text: string, icon: IconProp) => (
    <Button className="cx([flex items-center sidebar-item mt-8 first:mt-12" onClick={() => window.open(url, '_blank')}>
      <FontAwesomeIcon icon={icon} className="text-xl2" title={text} />
    </Button>
  );
  
  const renderMenuItem = (key: string, text: string, icon: string) => {
    const isHighlighted = pathname === `/${key}`; 
    return (
      <div key={key} className={cx(['flex items-center w-full px-7', isHighlighted && 'color-highlight-1'])} onClick={() => dispatch(push(key))}>
        <div className="w-6 flex items-center mr-6 my-3"><Icon path={icon} size={1} horizontal vertical rotate={180} color={isHighlighted ? '#279ceb' : '#CFD8E3'} /></div>
        <span className="text-lg">{text}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-grow items-center h-screen bg-color-1 overflow-y-auto w-65.5 box-border font-semibold">
      <div className="flex flex-col p-10">
        <img src="logo.png" alt="logo" className="w-20" />
      </div>
      <div className="flex cursor-pointer items-center justify-center bg-shoko-blue-background-alt w-full py-4">
        <div className="flex cursor-pointer items-center justify-center user-icon w-15 h-15 text-xl rounded-full" onClick={() => dispatch(setStatus(true))}>
          {username.charAt(0)}
        </div>
        <p className="ml-4"><span className="text-sm opacity-75">Welcome back,</span> <br/> {username}</p>
      </div>
      <div className="flex items-center mt-11 w-full px-7">
        <div className="w-6 flex items-center mr-6"><FontAwesomeIcon icon={faServer} className="text-xl2" title="Queue Count" /></div>
        <span className="text-shoko-highlight-2 text-lg">{(queueItems.HasherQueueCount + queueItems.GeneralQueueCount + queueItems.ImageQueueCount) ?? 0}</span>
      </div>
      <div className="flex flex-col justify-between mt-11 w-full">
      {renderMenuItem('dashboard', 'Dashboard', mdiTabletDashboard)}
      {renderMenuItem('collection', 'Collection', mdiLayersTripleOutline)}
      {renderMenuItem('utilities', 'Utilities', mdiTools)}
      {renderMenuItem('actions', 'Actions', mdiFormatListBulletedSquare)}
      {renderMenuItem('import-folders', 'Import Folders', mdiFolder)}
      {renderMenuItem('log', 'Log', mdiTextBoxOutline)}
      {renderMenuItem('settings', 'Settings', mdiCogOutline)}
      </div>
      <div className="flex flex-col justify-between mt-11 w-full bg-shoko-blue-background-alt">
        <div className="flex items-center w-full px-7">
          <div className="w-6 flex items-center mr-6 my-3"><Icon path={mdiMagnify} size={1} horizontal vertical rotate={180} color="#CFD8E3" /></div>
          <span className="text-lg">Search...</span>
        </div>
      </div>
      <div className="flex justify-between w-full self-end px-6 mt-auto py-6">
        <div className="w-6 flex items-center"><Icon path={mdiDiscord} size={1} horizontal vertical rotate={180} color="#CFD8E3" /></div>
        <div className="w-6 flex items-center"><Icon path={mdiHelpCircleOutline} size={1} horizontal vertical rotate={180} color="#CFD8E3" /></div>
        <div className="w-6 flex items-center"><Icon path={mdiGithub} size={1} horizontal vertical rotate={180} color="#CFD8E3" /></div>
      </div>
      {/*<div className="flex flex-col flex-grow justify-between">
        <div className="flex flex-col">
          {renderItem('dashboard', 'Dashboard', faTachometerAlt)}
          {renderItem('import-folders', 'Import Folders', faFolderOpen)}
          {renderItem('actions', 'Actions', faListAlt)}
          {renderItem('logs', 'Log', faFileAlt)}
          {renderItem('settings', 'Settings', faSlidersH)}
          <div key="logout" className="flex items-center sidebar-item mt-10" onClick={() => dispatch({ type: Events.AUTH_LOGOUT, payload: { clearState: true } })}>
            <FontAwesomeIcon icon={faSignOutAlt} className="text-xl2" title="Logout" />
          </div>
        </div>
        <div className="flex flex-col">
          {renderLink('https://discord.gg/vpeHDsg', 'Discord', faDiscord)}
          {renderLink('https://docs.shokoanime.com', 'Support', faQuestionCircle)}
          {renderLink('https://github.com/ShokoAnime', 'Github', faGithubSquare)}
        </div>
      </div>*/}
    </div>
  );
}

export default Sidebar;
