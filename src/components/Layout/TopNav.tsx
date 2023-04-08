import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Icon } from '@mdi/react';
import {
  mdiChevronDown,
  mdiCircleEditOutline,
  mdiCogOutline,
  mdiFormatListBulletedSquare, mdiGithub, mdiHelpCircleOutline,
  mdiLayersTripleOutline,
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
import { useMediaQuery } from 'react-responsive';
import { setStatus as setUtilitiesStatus } from '../../core/slices/modals/utilities';
import { setStatus as setActionsStatus } from '../../core/slices/modals/actions';
import { siDiscord } from 'simple-icons/icons';

function TopNav() {
  const dispatch = useDispatch();
  
  const queueItems = useSelector((state: RootState) => state.mainpage.queueStatus);
  const username = useSelector((state: RootState) => state.apiSession.username);
  const pathname = useSelector((state: RootState) => state.router.location.pathname);
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const utilitiesModalOpen = useSelector((state: RootState) => state.modals.utilities.status);
  const actionsModalOpen = useSelector((state: RootState) => state.modals.actions.status);

  const isSm = useMediaQuery({ minWidth: 0, maxWidth: 767 });

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

  const renderNonLinkMenuItem = (key: string, text: string, icon: string, onClick: () => void, modalOpen = false) => {
    const uri = `/webui/${key}`;
    const isHighlighted = pathname.startsWith(uri) || modalOpen;
    return (
      <div key={key} className={cx(['cursor-pointer flex items-center w-full px-7', isHighlighted && 'text-highlight-1'])} onClick={onClick}>
        <div className="w-6 flex items-center mr-3 my-3"><Icon path={icon} size={0.83} horizontal vertical rotate={180}/></div>
        <span className="text-lg">{text}</span>
      </div>
    );
  };

  const renderMenuItem = (key: string, text: string, icon: string) => {
    const uri = `/webui/${key}`;
    const isHighlighted = pathname.startsWith(uri);
    return (
      <div className="flex items-center w-full px-7 justify-between">
        <Link key={key} className={cx(['cursor-pointer flex items-center w-full', isHighlighted && 'text-highlight-1'])} to={uri} onClick={() => closeModalsAndSidebar()}>
          <div className="w-6 flex items-center mr-3 my-3"><Icon path={icon} size={0.83} horizontal vertical rotate={180}/></div>
          <span className="text-lg">{text}</span>
        </Link>
        {(!isSm && key === 'dashboard') && (
          <div onClick={() => dispatch(setLayoutEditMode(true))} className={cx('cursor-pointer transition-opacity', (pathname !== '/webui/dashboard' || layoutEditMode) && 'opacity-0 pointer-events-none')}>
            <Icon path={mdiCircleEditOutline} size={1} />
          </div>
        )}
      </div>
    );
  };

  const renderMenuLink = (url: string, icon: string) => (
    <div key={icon} className="cursor-pointer w-6 flex items-center" onClick={() => window.open(url, '_blank')}><Icon path={icon} size={0.83} horizontal vertical rotate={180} /></div>
  );

  return (
    <div className="flex flex-col bg-background-alt drop-shadow-[0_2px_2px_rgba(0,0,0,0.25)] z-[100]">
      <div className="flex justify-between p-6 items-center">
        <div className="flex space-x-2">
          <ShokoIcon className="w-6" />
          <span className="text-lg font-semibold">Shoko</span>
        </div>
        <div className="flex space-x-6">
          <div className="flex items-center">
            <Icon path={mdiServer} size={1} />
            <span className="ml-2 text-highlight-2">{(queueItems.HasherQueueCount + queueItems.GeneralQueueCount + queueItems.ImageQueueCount) ?? 0}</span>
          </div>
          <div className="flex items-center">
            <div className="flex items-center justify-center bg-highlight-1/75 hover:bg-highlight-1 w-8 h-8 text-xl rounded-full mr-3">
              {username.charAt(0)}
            </div>
            <span>{username}</span>
            <Icon className="ml-2" path={mdiChevronDown} size={1} />
          </div>
          <div className="flex items-center">
            <Icon path={mdiCogOutline} size={1} />
          </div>
        </div>
      </div>
      <div className="flex bg-background-nav justify-between">
        <div className="flex">
          {renderMenuItem('dashboard', 'Dashboard', mdiTabletDashboard)}
          {renderMenuItem('collection', 'Collection', mdiLayersTripleOutline)}
          <div className={cx('transition-opacity flex', layoutEditMode && 'opacity-50 pointer-events-none')}>
            {renderNonLinkMenuItem('utilities', 'Utilities', mdiTools, () => toggleModal('utilities'), utilitiesModalOpen)}
            {renderNonLinkMenuItem('actions', 'Actions', mdiFormatListBulletedSquare, () => toggleModal('actions'), actionsModalOpen)}
            {renderMenuItem('log', 'Log', mdiTextBoxOutline)}
            {renderMenuItem('settings', 'Settings', mdiCogOutline)}
          </div>
        </div>
        <div className="flex">
          {renderMenuLink('https://discord.gg/vpeHDsg', siDiscord.path)}
          {renderMenuLink('https://docs.shokoanime.com', mdiHelpCircleOutline)}
          {renderMenuLink('https://github.com/ShokoAnime', mdiGithub)}
        </div>
      </div>
    </div>
  );
}

export default TopNav;
