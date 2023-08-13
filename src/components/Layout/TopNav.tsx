import React, { useCallback, useMemo, useState } from 'react';
import AnimateHeight from 'react-animate-height';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  mdiChevronDown,
  mdiCogOutline,
  mdiDownloadCircleOutline,
  mdiFileDocumentAlertOutline,
  mdiFileQuestionOutline,
  mdiFormatListBulletedSquare,
  mdiGithub,
  mdiHelpCircleOutline,
  mdiLayersTripleOutline,
  mdiLoading,
  mdiServer,
  mdiTabletDashboard,
  mdiTextBoxOutline,
  mdiTools,
} from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import semver from 'semver';
import { siDiscord } from 'simple-icons';
import { useEventCallback } from 'usehooks-ts';

import ActionsModal from '@/components/Dialogs/ActionsModal';
import QueueModal from '@/components/Dialogs/QueueModal';
import Button from '@/components/Input/Button';
import ShokoIcon from '@/components/ShokoIcon';
import toast from '@/components/Toast';
import { useGetSettingsQuery } from '@/core/rtkQuery/splitV3Api/settingsApi';
import { useGetCurrentUserQuery } from '@/core/rtkQuery/splitV3Api/userApi';
import { useGetWebuiUpdateCheckQuery, useGetWebuiUpdateMutation } from '@/core/rtkQuery/splitV3Api/webuiApi';
import { setLayoutEditMode, setQueueModalOpen } from '@/core/slices/mainpage';
import { initialSettings } from '@/pages/settings/SettingsPage';

import AniDBBanDetectionItem from './AniDBBanDetectionItem';

import type { RootState } from '@/core/store';

const { DEV, VITE_APPVERSION } = import.meta.env;

const MenuItem = (
  { icon, id, isHighlighted, onClick, text }: {
    id: string;
    text: string;
    icon: string;
    onClick: () => void;
    isHighlighted: boolean;
  },
) => (
  <NavLink
    to={id}
    key={id}
    className={({ isActive }) => cx('flex items-center gap-x-2', (isActive || isHighlighted) && 'text-header-primary')}
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }}
  >
    <Icon path={icon} size={0.8333} />
    {text}
  </NavLink>
);

const ExternalLinkMenuItem = ({ icon, url }: { url: string, icon: string }) => (
  <a href={url} target="_blank" rel="noreferrer noopener">
    <Icon path={icon} size={0.8333} />
  </a>
);

function TopNav() {
  const dispatch = useDispatch();

  const navigate = useNavigate();
  const { pathname } = useLocation();

  const queueItems = useSelector((state: RootState) => state.mainpage.queueStatus);
  const banStatus = useSelector((state: RootState) => state.mainpage.banStatus);
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);
  const showQueueModal = useSelector((state: RootState) => state.mainpage.queueModalOpen);

  const settingsQuery = useGetSettingsQuery();
  const webuiSettings = settingsQuery?.data?.WebUI_Settings ?? initialSettings.WebUI_Settings;

  const checkWebuiUpdate = useGetWebuiUpdateCheckQuery({ channel: webuiSettings.updateChannel, force: false }, {
    skip: DEV || !settingsQuery.isSuccess,
  });
  const [webuiUpdateTrigger, webuiUpdateResult] = useGetWebuiUpdateMutation();

  const currentUser = useGetCurrentUserQuery();

  const [showUtilitiesMenu, setShowUtilitiesMenu] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);

  const closeModalsAndSubmenus = () => {
    setShowActionsModal(false);
    setShowUtilitiesMenu(false);
  };

  const handleQueueModalOpen = useEventCallback(() => {
    dispatch(setQueueModalOpen(true));
  });

  const handleQueueModalClose = useEventCallback(() => {
    dispatch(setQueueModalOpen(false));
  });

  const handleWebUiUpdate = () => {
    const renderToast = () => (
      <div className="flex flex-col gap-y-3">
        WebUI Update Successful!
        <div className="flex items-center justify-end">
          <Button
            onClick={() => {
              toast.dismiss('webui-update');
              navigate('/webui/dashboard');
              setTimeout(() => window.location.reload(), 100);
            }}
            buttonType="primary"
            className="w-full py-1.5 font-semibold"
          >
            Click Here to Reload
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
        className: 'w-80 ml-auto',
      });
    }, error => console.error(error));
  };

  const renderLinkMenuItem = useCallback((path: string, text: string, icon: string) => (
    <NavLink
      to={path}
      key={path.split('/').pop()}
      className={({ isActive }) => cx('flex items-center gap-x-2', isActive && 'text-header-primary')}
      onClick={closeModalsAndSubmenus}
    >
      <Icon path={icon} size={0.8333} />
      {text}
    </NavLink>
  ), []);

  const webuiUpdateStatus = useMemo(() => {
    if (webuiUpdateResult.isLoading) return 'Updating...';
    if (checkWebuiUpdate.isFetching) return 'Checking for update';
    return 'Update Available';
  }, [webuiUpdateResult.isLoading, checkWebuiUpdate.isFetching]);

  return (
    <>
      <div className="z-[100] flex flex-col bg-header-background text-sm font-semibold text-header-text drop-shadow-[0_2px_2px_rgba(0,0,0,0.25)]">
        <div className="mx-auto flex w-full max-w-[120rem] items-center justify-between px-8 py-6">
          <div className="flex items-center gap-x-2">
            <ShokoIcon className="w-6" />
            <span className="mt-1 text-xl font-semibold">Shoko</span>
          </div>
          <div className="flex items-center gap-x-8">
            <div className="flex items-center gap-x-2">
              <div
                className={cx(['cursor-pointer', showQueueModal ? 'text-header-primary' : undefined])}
                onClick={handleQueueModalOpen}
                title="Show Queue Modal"
              >
                <Icon path={mdiServer} size={0.8333} />
              </div>
              <span className="text-header-important">
                {(queueItems.HasherQueueState.queueCount + queueItems.GeneralQueueState.queueCount
                  + queueItems.ImageQueueState.queueCount) ?? 0}
              </span>
            </div>
            <div className="flex items-center gap-x-2">
              <div className="mr-1 flex h-8 w-8 items-center justify-center rounded-full bg-header-primary text-xl hover:bg-header-primary-hover">
                {currentUser.data?.Avatar
                  ? <img src={currentUser.data?.Avatar} alt="avatar" className="h-8 w-8 rounded-full" />
                  : currentUser.data?.Username.charAt(0)}
              </div>
              <span>{currentUser.data?.Username}</span>
              <Icon path={mdiChevronDown} size={0.6666} />
            </div>
            <NavLink
              to="settings"
              className={({ isActive }) => (isActive ? 'text-header-primary' : '')}
              onClick={() => closeModalsAndSubmenus()}
            >
              <Icon path={mdiCogOutline} size={0.8333} />
            </NavLink>
          </div>
        </div>
        <div className="bg-header-background-alt text-header-text-alt">
          <div className="mx-auto flex w-full max-w-[120rem] justify-between px-8 py-4">
            <div className="flex gap-x-8">
              {renderLinkMenuItem('dashboard', 'Dashboard', mdiTabletDashboard)}
              <div
                className={cx('transition-opacity flex gap-x-8', layoutEditMode && 'opacity-50 pointer-events-none')}
              >
                {renderLinkMenuItem('collection', 'Collection', mdiLayersTripleOutline)}
                <MenuItem
                  id="utilities"
                  text="Utilities"
                  icon={mdiTools}
                  onClick={() => setShowUtilitiesMenu(prev => !prev)}
                  isHighlighted={showUtilitiesMenu}
                />
                <MenuItem
                  id="actions"
                  text="Actions"
                  icon={mdiFormatListBulletedSquare}
                  onClick={() => setShowActionsModal(true)}
                  isHighlighted={showActionsModal}
                />
                {renderLinkMenuItem('log', 'Log', mdiTextBoxOutline)}
              </div>
            </div>
            <div className="flex justify-end gap-8">
              {pathname === '/webui/dashboard' && (
                <MenuItem
                  id="dashboard-settings"
                  text="Dashboard Settings"
                  icon={mdiTabletDashboard}
                  onClick={() => {
                    dispatch(setLayoutEditMode(true));
                    closeModalsAndSubmenus();
                  }}
                  isHighlighted={layoutEditMode}
                />
              )}
              {((checkWebuiUpdate.isSuccess && semver.gt(checkWebuiUpdate.data.Version, VITE_APPVERSION))
                || checkWebuiUpdate.isFetching) && !webuiUpdateResult.isSuccess && (
                <div
                  className="flex cursor-pointer items-center gap-x-2.5 font-semibold"
                  onClick={() => handleWebUiUpdate()}
                >
                  <Icon
                    path={checkWebuiUpdate.isFetching || webuiUpdateResult.isLoading
                      ? mdiLoading
                      : mdiDownloadCircleOutline}
                    size={1}
                    className={checkWebuiUpdate.isFetching || webuiUpdateResult.isLoading
                      ? 'text-header-primary'
                      : 'text-header-important'}
                    spin={checkWebuiUpdate.isFetching || webuiUpdateResult.isLoading}
                  />
                  <div className="flex">
                    Web UI&nbsp;
                    {webuiUpdateStatus}
                  </div>
                </div>
              )}
              {/* TODO: This maybe works, maybe doesn't. Cannot test properly. */}
              <AniDBBanDetectionItem type="HTTP" banStatus={banStatus.http} />
              <AniDBBanDetectionItem type="UDP" banStatus={banStatus.udp} />
              <div className="flex gap-x-5">
                <ExternalLinkMenuItem url="https://discord.gg/vpeHDsg" icon={siDiscord.path} />
                <ExternalLinkMenuItem url="https://docs.shokoanime.com" icon={mdiHelpCircleOutline} />
                <ExternalLinkMenuItem url="https://github.com/ShokoAnime" icon={mdiGithub} />
              </div>
            </div>
          </div>
        </div>
        <AnimateHeight
          height={showUtilitiesMenu ? 'auto' : 0}
          className="border-t border-header-border bg-header-background-alt"
        >
          <div className="mx-auto flex w-full max-w-[120rem] gap-x-8 px-8 py-4">
            {renderLinkMenuItem('utilities/unrecognized', 'Unrecognized Files', mdiFileQuestionOutline)}
            {renderLinkMenuItem('utilities/series-without-files', 'Series Without Files', mdiFileDocumentAlertOutline)}
          </div>
        </AnimateHeight>
      </div>
      <ActionsModal show={showActionsModal} onClose={() => setShowActionsModal(false)} />
      <QueueModal show={showQueueModal} onClose={handleQueueModalClose} />
    </>
  );
}

export default TopNav;
