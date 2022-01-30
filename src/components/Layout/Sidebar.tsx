import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import cx from 'classnames';
import { Icon } from '@mdi/react';
import {
  mdiTabletDashboard, mdiLayersTripleOutline, mdiTools, mdiServer,
  mdiFormatListBulletedSquare, mdiTextBoxOutline, mdiCogOutline,
  mdiChevronDown, mdiDiscord, mdiHelpCircleOutline, mdiGithub,
} from '@mdi/js';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import { setStatus } from '../../core/slices/modals/profile';
import Button from '../Input/Button';

function Sidebar() {
  const dispatch = useDispatch();

  const pathname = useSelector((state: RootState) => state.router.location.pathname);
  const queueItems = useSelector((state: RootState) => state.mainpage.queueStatus);
  const username = useSelector((state: RootState) => state.apiSession.username);

  useEffect(() => {
    dispatch(setStatus(false));
  }, []);

  const renderItem = (key: string, text: string, icon: string) => (
    <div className="sidebar-item mt-5 first:mt-12">
      <Button key={key} className={cx(['flex items-center', pathname === `/${key}` && 'color-highlight-1'])} onClick={() => dispatch(push(key))}>
        <Icon path={icon} size={1} title={text} />
        <div className="text-lg font-semibold ml-5">{text}</div>
      </Button>
    </div>
  );

  const renderLink = (url: string, text: string, icon: string) => (
    <Button className="flex items-center sidebar-item" onClick={() => window.open(url, '_blank')}>
      <Icon path={icon} size={1} title={text} />
    </Button>
  );

  return (
    <div className="flex flex-col flex-grow items-center h-screen bg-color-nav overflow-y-auto">
      
      <div className="flex flex-col w-full">

        {/* Logo */}
        <div className="flex justify-center items-center">
          <img src="logo.png" alt="logo" className="w-20 mt-10" />
        </div>

        {/* Username */}
        <div className="bg-color-alt flex items-center mt-11 p-5">
          <div className="flex cursor-pointer items-center justify-center user-icon w-12 h-12 text-xl rounded-full" onClick={() => dispatch(setStatus(true))}>
            {username.charAt(0)}
          </div>
          <div className="flex flex-col justify-center ml-4">
            <div className="text-sm">Welcome Back</div>
            <div className="flex items-center sidebar-item">
              {/* TODO: Change to dropdown instead of logout */}
              <Button key="username" className="flex items-center font-semibold text-base" onClick={() => dispatch({ type: Events.AUTH_LOGOUT, payload: { clearState: true } })}>
                {username}
                <Icon path={mdiChevronDown} size={0.75} className="ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Queue Count */}
        <div className="flex mt-10 ml-7 items-center">
          <Icon path={mdiServer} horizontal vertical title="Queue Count" size={1} />
          <span className="ml-5 color-highlight-2 text-lg font-semibold">{(queueItems.HasherQueueCount + queueItems.GeneralQueueCount + queueItems.ImageQueueCount) ?? 0}</span>
        </div>

      </div>

      <div className="flex flex-col flex-grow justify-between w-full px-6 pb-6">

        {/* Menu Items */}
        <div className="flex flex-col pr-10">
          {renderItem('dashboard', 'Dashboard', mdiTabletDashboard)}
          {/* FIXME: Fix collections link */}
          {renderItem('#', 'Collection', mdiLayersTripleOutline)}
          {/* FIXME: Fix utilities link */}
          {renderItem('import-folders', 'Utilities', mdiTools)}
          {renderItem('actions', 'Actions', mdiFormatListBulletedSquare)}
          {renderItem('logs', 'Log', mdiTextBoxOutline)}
          {renderItem('settings', 'Settings', mdiCogOutline)}
        </div>

        {/* TODO: Create search bar */}
        {/* TODO: Create update notifications */}

        {/* Links */}
        <div className="flex justify-between w-full">
          {renderLink('https://discord.gg/vpeHDsg', 'Discord', mdiDiscord)}
          {renderLink('https://docs.shokoanime.com', 'Support', mdiHelpCircleOutline)}
          {renderLink('https://github.com/ShokoAnime', 'Github', mdiGithub)}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
