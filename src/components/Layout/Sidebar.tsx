import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import cx from 'classnames';
import { Icon } from '@mdi/react';
import {
  mdiServer,
  mdiCogOutline,
  mdiFormatListBulletedSquare,
  mdiLayersTripleOutline,
  mdiTabletDashboard, mdiTextBoxOutline,
  mdiTools,
  mdiFolder,
  mdiMagnify,
  mdiDiscord,
  mdiHelpCircleOutline,
  mdiGithub,
  mdiLogout,
} from '@mdi/js';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import { setStatus } from '../../core/slices/modals/profile';

function Sidebar() {
  const dispatch = useDispatch();

  const pathname = useSelector((state: RootState) => state.router.location.pathname);
  const queueItems = useSelector((state: RootState) => state.mainpage.queueStatus);
  const username = useSelector((state: RootState) => state.apiSession.username);

  useEffect(() => {
    dispatch(setStatus(false));
  }, []);
  
  const renderMenuItem = (key: string, text: string, icon: string) => {
    const isHighlighted = pathname === `/${key}`; 
    return (
      <div key={key} className={cx(['cursor-pointer flex items-center w-full px-7', isHighlighted && 'color-highlight-1'])} onClick={() => dispatch(push(key))}>
        <div className="w-6 flex items-center mr-6 my-3"><Icon path={icon} size={1} horizontal vertical rotate={180} color={isHighlighted ? '#279ceb' : '#CFD8E3'} /></div>
        <span className="text-lg">{text}</span>
      </div>
    );
  };
  
  const renderMenuLink = (url: string, icon: string) => (
      <div key={icon} className="cursor-pointer w-6 flex items-center" onClick={() => window.open(url, '_blank')}><Icon path={icon} size={1} horizontal vertical rotate={180} color="#CFD8E3" /></div>
  );

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
        <div className="w-6 flex items-center mr-6"><Icon path={mdiServer} size={1} horizontal vertical rotate={180} color="#CFD8E3" /></div>
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
        <div key="logout" className="flex items-center w-full px-7 cursor-pointer mt-11" onClick={() => dispatch({ type: Events.AUTH_LOGOUT, payload: { clearState: true } })}>
          <div className="w-6 flex items-center mr-6 my-3"><Icon path={mdiLogout} size={1} horizontal vertical rotate={180} color="#CFD8E3" /></div>
          <span className="text-lg">Logout</span>
        </div>
      </div>
      <div className="flex flex-col justify-between mt-11 w-full bg-shoko-blue-background-alt">
        <div className="flex items-center w-full px-7">
          <div className="w-6 flex items-center mr-6 my-3"><Icon path={mdiMagnify} size={1} horizontal vertical rotate={180} color="#CFD8E3" /></div>
          <span className="text-lg">Search...</span>
        </div>
      </div>
      <div className="flex justify-between w-full self-end px-6 mt-auto py-6">
        {renderMenuLink('https://discord.gg/vpeHDsg', mdiDiscord)}
        {renderMenuLink('https://docs.shokoanime.com', mdiHelpCircleOutline)}
        {renderMenuLink('https://github.com/ShokoAnime', mdiGithub)}
      </div>
    </div>
  );
}

export default Sidebar;
