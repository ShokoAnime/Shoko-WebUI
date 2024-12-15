import React, { useMemo, useState } from 'react';
import AnimateHeight from 'react-animate-height';
import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink, useLocation } from 'react-router';
import {
  mdiCogOutline,
  mdiDownloadCircleOutline,
  mdiFileDocumentAlertOutline,
  mdiFileDocumentEditOutline,
  mdiFileDocumentMultipleOutline,
  mdiFileQuestionOutline,
  mdiFileSearchOutline,
  mdiFormatListBulletedSquare,
  mdiGithub,
  mdiHelpCircleOutline,
  mdiInformationOutline,
  mdiLayersTripleOutline,
  mdiLoading,
  mdiLogout,
  mdiServer,
  mdiTextBoxOutline,
  mdiTools,
  mdiViewDashboardEditOutline,
  mdiViewDashboardOutline,
} from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { startsWith } from 'lodash';
import semver from 'semver';
import { siDiscord } from 'simple-icons';

import DashboardSettingsModal from '@/components/Dashboard/DashboardSettingsModal';
import ActionsModal from '@/components/Dialogs/ActionsModal';
import Button from '@/components/Input/Button';
import ExternalLinkMenuItem from '@/components/Layout/ExternalLinkMenuItem';
import LinkMenuItem from '@/components/Layout/LinkMenuItem';
import MenuItem from '@/components/Layout/MenuItem';
import ShokoIcon from '@/components/ShokoIcon';
import toast from '@/components/Toast';
import Events from '@/core/events';
import { useCheckNetworkConnectivityMutation } from '@/core/react-query/settings/mutations';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import { useCurrentUserQuery } from '@/core/react-query/user/queries';
import { useUpdateWebuiMutation } from '@/core/react-query/webui/mutations';
import { useWebuiUpdateCheckQuery } from '@/core/react-query/webui/queries';
import { NetworkAvailabilityEnum } from '@/core/signalr/types';
import useEventCallback from '@/hooks/useEventCallback';
import useNavigateVoid from '@/hooks/useNavigateVoid';

import AniDBBanDetectionItem from './AniDBBanDetectionItem';

import type { RootState } from '@/core/store';

const { DEV, VITE_APPVERSION } = import.meta.env;

const QueueCount = () => {
  const queue = useSelector((state: RootState) => state.mainpage.queueStatus);

  return (
    <div
      className="flex items-center gap-x-2"
      data-tooltip-id="tooltip"
      data-tooltip-content={`Queue Count: ${queue.TotalCount}`}
    >
      <Icon path={mdiServer} size={1} />
      <span className="text-header-text-important">
        {queue.TotalCount}
      </span>
    </div>
  );
};

function TopNav() {
  const dispatch = useDispatch();

  const navigate = useNavigateVoid();
  const { pathname } = useLocation();

  const networkStatus = useSelector((state: RootState) => state.mainpage.networkStatus);
  const banStatus = useSelector((state: RootState) => state.mainpage.banStatus);
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const settingsQuery = useSettingsQuery();
  const webuiSettings = settingsQuery.data.WebUI_Settings;

  const checkWebuiUpdate = useWebuiUpdateCheckQuery(
    { channel: webuiSettings.updateChannel, force: false },
    !DEV && settingsQuery.isSuccess,
  );
  const {
    isPending: isUpdateWebuiPending,
    isSuccess: isUpdateWebuiSuccess,
    mutate: updateWebui,
  } = useUpdateWebuiMutation();

  const { isPending: isNetworkCheckPending, mutate: checkNetworkConnectivity } = useCheckNetworkConnectivityMutation();

  const currentUserQuery = useCurrentUserQuery();

  const [showUtilitiesMenu, setShowUtilitiesMenu] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [showDashboardSettingsModal, setShowDashboardSettingsModal] = useState(false);

  const isOffline = useMemo(
    () =>
      !(networkStatus === NetworkAvailabilityEnum.Internet
        || networkStatus === NetworkAvailabilityEnum.PartialInternet),
    [networkStatus],
  );

  const closeModalsAndSubmenus = useEventCallback((event?: React.MouseEvent, id?: string) => {
    if (layoutEditMode && event) {
      event.preventDefault();
      return;
    }
    setShowActionsModal(false);
    setShowDashboardSettingsModal(false);
    if (id !== 'utilities') setShowUtilitiesMenu(false);
  });

  const handleLogout = useEventCallback(() => {
    dispatch({ type: Events.AUTH_LOGOUT });
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

    updateWebui(webuiSettings.updateChannel, {
      onSuccess: () =>
        toast.success('', renderToast(), {
          autoClose: false,
          draggable: false,
          closeOnClick: false,
          toastId: 'webui-update',
          className: 'w-80 ml-auto',
        }),
    });
  };

  const webuiUpdateStatus = useMemo(() => {
    if (isUpdateWebuiPending) return 'Updating WebUI...';
    if (checkWebuiUpdate.isFetching) return 'Checking for WebUI update';
    return 'WebUI Update Available';
  }, [isUpdateWebuiPending, checkWebuiUpdate.isFetching]);

  return (
    <>
      <div
        className={cx(
          'z-[100] flex flex-col bg-header-background font-semibold text-header-text drop-shadow-[0_2px_2px_rgba(0,0,0,0.25)] transition-opacity',
          layoutEditMode && 'opacity-65 pointer-events-none',
        )}
      >
        <div className="mx-auto flex w-full max-w-[120rem] items-center justify-between px-6 py-2">
          <Link to="/webui/dashboard" className="flex items-center gap-x-3">
            <ShokoIcon className="w-20" />
            <span className="mt-1 text-2xl font-semibold text-header-text">Shoko</span>
          </Link>
          <div className="flex items-center gap-x-6">
            <QueueCount />
            <div className="flex items-center gap-x-2">
              <div className="mr-1 flex size-8 items-center justify-center rounded-full bg-header-user-background text-xl text-header-user-text">
                {currentUserQuery.data?.Avatar
                  ? <img src={currentUserQuery.data?.Avatar} alt="avatar" className="size-8 rounded-full" />
                  : currentUserQuery.data?.Username.charAt(0)}
              </div>
              <span className="text-header-text">{currentUserQuery.data?.Username}</span>
            </div>
            <NavLink
              to="settings"
              className={({ isActive }) =>
                cx({ 'text-topnav-text-primary': isActive, 'opacity-65 pointer-events-none': layoutEditMode })}
              onClick={closeModalsAndSubmenus}
              data-tooltip-id="tooltip"
              data-tooltip-content="Settings"
              data-tooltip-place="bottom"
            >
              <Icon
                className="transition-colors hover:text-header-icon-primary"
                path={mdiCogOutline}
                size={1}
              />
            </NavLink>
            <Button
              onClick={handleLogout}
              tooltip="Log out"
              tooltipPlace="bottom"
            >
              <Icon
                className="transition-colors hover:text-header-icon-primary"
                path={mdiLogout}
                size={1}
              />
            </Button>
          </div>
        </div>
        <div className="bg-topnav-background text-topnav-text">
          <div className="mx-auto flex w-full max-w-[120rem] justify-between px-6 py-4">
            <div className="flex gap-x-6">
              <LinkMenuItem
                icon={mdiViewDashboardOutline}
                onClick={closeModalsAndSubmenus}
                path="dashboard"
                text="Dashboard"
              />

              <LinkMenuItem
                icon={mdiLayersTripleOutline}
                onClick={closeModalsAndSubmenus}
                path="collection"
                text="Collection"
              />
              <MenuItem
                id="utilities"
                text="Utilities"
                icon={mdiTools}
                onClick={() => {
                  closeModalsAndSubmenus(undefined, 'utilities');
                  setShowUtilitiesMenu(prev => !prev);
                }}
                isHighlighted={showUtilitiesMenu || startsWith(pathname, '/webui/utilities/')}
              />
              <LinkMenuItem
                onClick={closeModalsAndSubmenus}
                icon={mdiTextBoxOutline}
                path="log"
                text="Log"
              />
              <MenuItem
                id="actions"
                text="Actions"
                icon={mdiFormatListBulletedSquare}
                onClick={() => {
                  closeModalsAndSubmenus();
                  setShowActionsModal(true);
                }}
                isHighlighted={showActionsModal}
              />
            </div>
            <div className="flex justify-end gap-6">
              {pathname === '/webui/dashboard' && (
                <MenuItem
                  id="dashboard-settings"
                  text="Dashboard Settings"
                  icon={mdiViewDashboardEditOutline}
                  onClick={() => {
                    closeModalsAndSubmenus();
                    setShowDashboardSettingsModal(true);
                  }}
                  isHighlighted={layoutEditMode || showDashboardSettingsModal}
                />
              )}
              {((checkWebuiUpdate.isSuccess && semver.gt(checkWebuiUpdate.data.Version, VITE_APPVERSION))
                || checkWebuiUpdate.isFetching) && !isUpdateWebuiSuccess && (
                <div
                  className="flex cursor-pointer items-center gap-x-2.5 font-semibold"
                  onClick={() => handleWebUiUpdate()}
                >
                  <Icon
                    path={checkWebuiUpdate.isFetching || isUpdateWebuiPending
                      ? mdiLoading
                      : mdiDownloadCircleOutline}
                    size={1}
                    className={checkWebuiUpdate.isFetching || isUpdateWebuiPending
                      ? 'text-topnav-text-primary'
                      : 'text-header-text-important'}
                    spin={checkWebuiUpdate.isFetching || isUpdateWebuiPending}
                  />
                  <div className="flex">
                    {webuiUpdateStatus}
                  </div>
                </div>
              )}
              {isOffline && (
                <Button
                  className="flex items-center gap-x-2 font-semibold"
                  onClick={() => checkNetworkConnectivity()}
                >
                  {isNetworkCheckPending
                    ? (
                      <Icon
                        path={mdiLoading}
                        size={1}
                        className="text-panel-text-primary"
                        spin
                      />
                    )
                    : (
                      <Icon
                        path={mdiInformationOutline}
                        size={1}
                        className="text-topnav-icon-warning"
                      />
                    )}
                  No Internet Connection
                </Button>
              )}
              <AniDBBanDetectionItem type="HTTP" banStatus={banStatus.http} />
              <AniDBBanDetectionItem type="UDP" banStatus={banStatus.udp} />
              <div className="flex items-center gap-x-5">
                <ExternalLinkMenuItem url="https://discord.gg/vpeHDsg" icon={siDiscord.path} name="Discord" />
                <ExternalLinkMenuItem url="https://docs.shokoanime.com" icon={mdiHelpCircleOutline} name="Docs" />
                <ExternalLinkMenuItem url="https://github.com/ShokoAnime" icon={mdiGithub} name="GitHub" />
              </div>
            </div>
          </div>
        </div>
        <AnimateHeight
          height={showUtilitiesMenu ? 'auto' : 0}
          className="border-t border-topnav-border bg-topnav-background"
        >
          <div className="mx-auto flex w-full max-w-[120rem] gap-x-6 px-6 py-4 text-sm">
            <LinkMenuItem
              icon={mdiFileQuestionOutline}
              onClick={closeModalsAndSubmenus}
              path="utilities/unrecognized"
              text="Unrecognized Files"
            />
            <LinkMenuItem
              icon={mdiFileDocumentMultipleOutline}
              onClick={closeModalsAndSubmenus}
              path="utilities/release-management"
              text="Release Management"
            />
            <LinkMenuItem
              icon={mdiFileDocumentAlertOutline}
              onClick={closeModalsAndSubmenus}
              path="utilities/series-without-files"
              text="Series Without Files"
            />
            <LinkMenuItem
              icon={mdiFileSearchOutline}
              onClick={closeModalsAndSubmenus}
              path="utilities/file-search"
              text="File Search"
            />
            <LinkMenuItem
              icon={mdiFileDocumentEditOutline}
              onClick={closeModalsAndSubmenus}
              path="utilities/renamer"
              text="File Rename"
            />
          </div>
        </AnimateHeight>
      </div>
      <ActionsModal show={showActionsModal} onClose={() => setShowActionsModal(false)} />
      <DashboardSettingsModal show={showDashboardSettingsModal} onClose={() => setShowDashboardSettingsModal(false)} />
    </>
  );
}

export default TopNav;
