import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
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
  mdiHelpCircleOutline,
  mdiGithub,
  mdiLogout,
  mdiCircleEditOutline,
} from '@mdi/js';
import { siDiscord } from 'simple-icons/icons';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import { setStatus } from '../../core/slices/modals/profile';
import { setStatus as setActionsStatus } from '../../core/slices/modals/actions';
import { setStatus as setUtilitiesStatus } from '../../core/slices/modals/utilities';
import { setStatus as setEditDashboardStatus } from '../../core/slices/modals/editDashboard';
import { default as ShokoIcon } from '../ShokoIcon';

function Sidebar() {
  const dispatch = useDispatch();

  const pathname = useSelector((state: RootState) => state.router.location.pathname);
  const queueItems = useSelector((state: RootState) => state.mainpage.queueStatus);
  const username = useSelector((state: RootState) => state.apiSession.username);

  useEffect(() => {
    dispatch(setStatus(false));
  }, []);

  const renderNonLinkMenuItem = (key: string, text: string, icon: string, onClick: () => void) => {
    const uri = `/webui/${key}`;
    const isHighlighted = pathname.startsWith(uri);
    return (
      <div key={key} className={cx(['cursor-pointer flex items-center w-full px-7', isHighlighted && 'text-highlight-1'])} onClick={onClick}>
        <div className="w-6 flex items-center mr-6 my-3"><Icon path={icon} size={1} horizontal vertical rotate={180}/></div>
        <span className="text-lg">{text}</span>
      </div>
    );
  };

  const renderMenuItem = (key: string, text: string, icon: string, additionalNav?: { icon: string, onClick: () => void }) => {
    const uri = `/webui/${key}`;
    const isHighlighted = pathname.startsWith(uri);
    return (
      <Link key={key} className={cx(['cursor-pointer flex items-center w-full px-7', isHighlighted && 'text-highlight-1'])} to={uri}>
        <div className="w-6 flex items-center mr-6 my-3"><Icon path={icon} size={1} horizontal vertical rotate={180}/></div>
        <span className="text-lg">{text}</span>
        {additionalNav && <div className="w-6 flex items-center ml-3 my-3" onClick={additionalNav.onClick}><Icon path={additionalNav.icon} size={1} horizontal vertical rotate={180}/></div>}
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
      <div className="flex cursor-pointer items-center justify-center bg-background-alt w-full py-4">
        <div className="flex cursor-pointer items-center justify-center bg-highlight-1/75 hover:bg-highlight-1 w-15 h-15 text-xl rounded-full" onClick={() => dispatch(setStatus(true))}>
          {username.charAt(0)}
        </div>
        <p className="ml-4"><span className="text-sm opacity-75">Welcome back,</span> <br/> {username}</p>
      </div>
      <div className="flex items-center mt-11 w-full px-7">
        <div className="w-6 flex items-center mr-6"><Icon path={mdiServer} size={1} horizontal vertical rotate={180} /></div>
        <span className="text-highlight-2 text-lg">{(queueItems.HasherQueueCount + queueItems.GeneralQueueCount + queueItems.ImageQueueCount) ?? 0}</span>
      </div>
      <div className="flex flex-col justify-between mt-11 w-full">
        {renderMenuItem('dashboard', 'Dashboard', mdiTabletDashboard, { icon: mdiCircleEditOutline, onClick: () => dispatch(setEditDashboardStatus(true)) })}
        {renderMenuItem('collection', 'Collection', mdiLayersTripleOutline)}
        {renderNonLinkMenuItem('utilities', 'Utilities', mdiTools, () => dispatch(setUtilitiesStatus(true)))}
        {renderNonLinkMenuItem('actions', 'Actions', mdiFormatListBulletedSquare, () => dispatch(setActionsStatus(true)))}
        {renderMenuItem('import-folders', 'Import Folders', mdiFolder)}
        {renderMenuItem('log', 'Log', mdiTextBoxOutline)}
        {renderMenuItem('settings', 'Settings', mdiCogOutline)}
        <div key="logout" className="flex items-center w-full px-7 cursor-pointer mt-11" onClick={() => dispatch({ type: Events.AUTH_LOGOUT, payload: { clearState: true } })}>
          <div className="w-6 flex items-center mr-6 my-3"><Icon path={mdiLogout} size={1} horizontal vertical rotate={180} /></div>
          <span className="text-lg">Logout</span>
        </div>
      </div>
      <div className="flex flex-col justify-between mt-11 w-full bg-background-alt">
        <div className="flex items-center w-full px-7">
          <div className="w-6 flex items-center mr-6 my-3"><Icon path={mdiMagnify} size={1} horizontal vertical rotate={180} /></div>
          <span className="text-lg">Search...</span>
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
