import React, { useMemo, useState } from 'react';
import AnimateHeight from 'react-animate-height';
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
import ServerUpdateModal from '@/components/Dashboard/ServerUpdateModal';
import WebUIUpdateModal from '@/components/Dashboard/WebUIUpdateModal';
import ActionsModal from '@/components/Dialogs/ActionsModal';
import Button from '@/components/Input/Button';
import ExternalLinkMenuItem from '@/components/Layout/ExternalLinkMenuItem';
import LinkMenuItem from '@/components/Layout/LinkMenuItem';
import MenuItem from '@/components/Layout/MenuItem';
import ShokoIcon from '@/components/ShokoIcon';
import Events from '@/core/events';
import { useVersionQuery } from '@/core/react-query/init/queries';
import { useCheckNetworkConnectivityMutation } from '@/core/react-query/settings/mutations';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import { useCurrentUserQuery } from '@/core/react-query/user/queries';
import { useServerUpdateCheckQuery, useWebuiUpdateCheckQuery } from '@/core/react-query/webui/queries';
import { NetworkAvailabilityEnum } from '@/core/signalr/types';
import { useDispatch, useSelector } from '@/core/store';
import { getUiVersion, isDebug } from '@/core/util';

import AniDBBanDetectionItem from './AniDBBanDetectionItem';

const QueueCount = () => {
  const queue = useSelector(state => state.mainpage.queueStatus);

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

const TopNav = () => {
  const dispatch = useDispatch();

  const { pathname } = useLocation();

  const networkStatus = useSelector(state => state.mainpage.networkStatus);
  const banStatus = useSelector(state => state.mainpage.banStatus);
  const layoutEditMode = useSelector(state => state.mainpage.layoutEditMode);

  const { data: versionData } = useVersionQuery();
  const settingsQuery = useSettingsQuery();
  const webuiSettings = settingsQuery.data.WebUI_Settings;

  const serverUpdateCheckQuery = useServerUpdateCheckQuery(
    { channel: webuiSettings.serverUpdateChannel, force: false },
    settingsQuery.isSuccess,
  );
  const webuiUpdateCheckQuery = useWebuiUpdateCheckQuery(
    { channel: webuiSettings.updateChannel, force: false },
    !isDebug() && settingsQuery.isSuccess,
  );

  const updateCheckIsFetching = webuiUpdateCheckQuery.isFetching || serverUpdateCheckQuery.isFetching;

  const { isPending: isNetworkCheckPending, mutate: checkNetworkConnectivity } = useCheckNetworkConnectivityMutation();

  const currentUserQuery = useCurrentUserQuery();

  const [showUtilitiesMenu, setShowUtilitiesMenu] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [showDashboardSettingsModal, setShowDashboardSettingsModal] = useState(false);
  const [showServerUpdateModal, setShowServerUpdateModal] = useState(false);
  const [showWebuiUpdateModal, setShowWebuiUpdateModal] = useState(false);

  const isOffline = useMemo(
    () =>
      !(networkStatus === NetworkAvailabilityEnum.Internet
        || networkStatus === NetworkAvailabilityEnum.PartialInternet),
    [networkStatus],
  );

  const closeModalsAndSubmenus = (event?: React.MouseEvent, id?: string) => {
    if (layoutEditMode && event) {
      event.preventDefault();
      return;
    }
    setShowActionsModal(false);
    setShowDashboardSettingsModal(false);
    if (id !== 'utilities') setShowUtilitiesMenu(false);
  };

  const handleLogout = () => {
    dispatch({ type: Events.AUTH_LOGOUT });
  };

  return (
    <>
      <div
        className={cx(
          'z-100 flex flex-col bg-header-background font-semibold text-header-text drop-shadow-[0_2px_2px_rgba(0,0,0,0.25)] transition-opacity',
          layoutEditMode && 'pointer-events-none opacity-65',
        )}
      >
        <div className="mx-auto flex w-full max-w-480 items-center justify-between px-6 py-2">
          <Link to="/webui/dashboard" className="flex items-center gap-x-3">
            <ShokoIcon className="size-20" />
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
                cx({ 'text-topnav-text-primary': isActive, 'pointer-events-none opacity-65': layoutEditMode })}
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
          <div className="mx-auto flex w-full max-w-480 justify-between px-6 py-4">
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
              {updateCheckIsFetching && (
                <div className="flex cursor-pointer items-center gap-x-2.5 font-semibold">
                  <Icon path={mdiLoading} size={1} spin className="text-topnav-text-primary" />
                  Checking for updates
                </div>
              )}
              {!updateCheckIsFetching && serverUpdateCheckQuery.isSuccess
                && semver.gt(serverUpdateCheckQuery.data.Version, versionData?.Server.Version ?? '999.999.999') && (
                <div
                  className="flex cursor-pointer items-center gap-x-2 font-semibold"
                  onClick={() => setShowServerUpdateModal(true)}
                >
                  <Icon path={mdiDownloadCircleOutline} size={1} className="text-header-text-important" />
                  <div>
                    Server Update Available
                  </div>
                </div>
              )}
              {!updateCheckIsFetching && webuiUpdateCheckQuery.isSuccess
                && semver.gt(webuiUpdateCheckQuery.data.Version, getUiVersion()) && (
                <div
                  className="flex cursor-pointer items-center gap-x-2 font-semibold"
                  onClick={() => setShowWebuiUpdateModal(true)}
                >
                  <Icon path={mdiDownloadCircleOutline} size={1} className="text-header-text-important" />
                  <div>
                    WebUI Update Available
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
          <div className="mx-auto flex w-full max-w-480 gap-x-6 px-6 py-4 text-sm">
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
              text="Rename/Move Files"
            />
          </div>
        </AnimateHeight>
      </div>

      <ActionsModal show={showActionsModal} onClose={() => setShowActionsModal(false)} />
      <DashboardSettingsModal show={showDashboardSettingsModal} onClose={() => setShowDashboardSettingsModal(false)} />
      <ServerUpdateModal onClose={() => setShowServerUpdateModal(false)} show={showServerUpdateModal} />
      <WebUIUpdateModal onClose={() => setShowWebuiUpdateModal(false)} show={showWebuiUpdateModal} />
    </>
  );
};

export default TopNav;
