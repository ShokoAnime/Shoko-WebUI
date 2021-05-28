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
    <Button className="flex items-center sidebar-item mt-8 first:mt-12" onClick={() => window.open(url, '_blank')}>
      <FontAwesomeIcon icon={icon} className="text-xl2" title={text} />
    </Button>
  );

    return (
        <div className="flex flex-col flex-grow items-center p-4 h-screen bg-color-1 overflow-y-auto">
          <div className="flex flex-col">
            <img src="logo.png" alt="logo" className="w-12" />
        <div className="flex cursor-pointer items-center justify-center user-icon w-12 h-12 text-xl rounded-full mt-12" onClick={() => dispatch(setStatus(true))}>
              {username.charAt(0)}
            </div>
            <div className="flex flex-col mt-10 items-center">
              <FontAwesomeIcon icon={faServer} className="text-xl2" title="Queue Count" />
          <span className="mt-2 color-highlight-1">{(queueItems.HasherQueueCount + queueItems.GeneralQueueCount + queueItems.ImageQueueCount) ?? 0}</span>
            </div>
          </div>
          <div className="flex flex-col flex-grow justify-between">
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
          {renderLink('https://docs.shokoanime.com', 'Support', faQuestionCircle)}
          {renderLink('https://discord.gg/vpeHDsg', 'Discord', faDiscord)}
          {renderLink('https://github.com/ShokoAnime', 'Github', faGithubSquare)}
            </div>
          </div>
        </div>
    );
  }

export default Sidebar;
