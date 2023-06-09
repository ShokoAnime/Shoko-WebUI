import React, { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@mdi/react';
import { mdiChevronDown,
  mdiCogOutline,
  mdiDownloadCircleOutline,
  mdiFormatListBulletedSquare,
  mdiGithub,
  mdiHelpCircleOutline,
  mdiInformationOutline,
  mdiLayersTripleOutline,
  mdiLoading,
  mdiServer,
  mdiTabletDashboard,
  mdiTextBoxOutline,
  mdiTools } from '@mdi/js';
import cx from 'classnames';
import { siDiscord } from 'simple-icons';
import semver from 'semver';
import AnimateHeight from 'react-animate-height';

import { setLayoutEditMode } from '@/core/slices/mainpage';

import { useGetWebuiUpdateCheckQuery, useGetWebuiUpdateMutation } from '@/core/rtkQuery/splitV3Api/webuiApi';
import { useGetSettingsQuery } from '@/core/rtkQuery/splitV3Api/settingsApi';
import { useGetCurrentUserQuery } from '@/core/rtkQuery/splitV3Api/userApi';
import { initialSettings } from '@/pages/settings/SettingsPage';
import ActionsModal from '@/components/Dialogs/ActionsModal';
import { RootState } from '@/core/store';
import Button from '../Input/Button';
import toast from '../Toast';

import ShokoIcon from '../ShokoIcon';

const { DEV, VITE_APPVERSION } = import.meta.env;

const MenuItem = ({ id, text, icon, onClick, isHighlighted }: { id: string, text: string, icon: string, onClick: () => void, isHighlighted: boolean }) => (
  <NavLink
    to={id}
    key={id}
    className={({ isActive }) => cx('flex items-center gap-x-2', (isActive || isHighlighted) && 'text-highlight-1')}
    onClick={(e) => { e.preventDefault(); onClick(); }}
  >
    <Icon path={icon} size={0.8333} />
    {text}
  </NavLink>
);

const ExternalLinkMenuItem = ({ url, icon }: { url: string, icon: string }) => (
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

  const settingsQuery = useGetSettingsQuery();
  const webuiSettings = settingsQuery?.data?.WebUI_Settings ?? initialSettings.WebUI_Settings;

  const checkWebuiUpdate = useGetWebuiUpdateCheckQuery({ channel: webuiSettings.updateChannel, force: false }, { skip: DEV || !settingsQuery.isSuccess });
  const [webuiUpdateTrigger, webuiUpdateResult] = useGetWebuiUpdateMutation();

  const currentUser = useGetCurrentUserQuery();

  const [showUtilitiesMenu, setShowUtilitiesMenu] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);

  const closeModalsAndSubmenus = () => {
    setShowActionsModal(false);
    setShowUtilitiesMenu(false);
  };

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
            className="bg-highlight-1 py-1.5 w-full"
          >
            Click here to reload
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
        className: 'w-72 ml-auto',
      });
    }, error => console.error(error));
  };

  const renderLinkMenuItem = useCallback((path: string, text: string, icon: string) => (
    <NavLink
      to={path}
      key={path.split('/').pop()}
      className={({ isActive }) => cx('flex items-center gap-x-2', isActive && 'text-highlight-1')}
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
      <div className="flex flex-col bg-background-alt drop-shadow-[0_2px_2px_rgba(0,0,0,0.25)] z-[100] text-sm font-semibold">
        <div className="flex justify-between px-8 py-6 items-center max-w-[120rem] w-full mx-auto">
          <div className="flex items-center gap-x-2">
            <ShokoIcon className="w-6" />
            <span className="text-xl font-semibold mt-1">Shoko</span>
          </div>
          <div className="flex items-center gap-x-8">
            <div className="flex items-center gap-x-2">
              <Icon path={mdiServer} size={0.8333} />
              <span className="text-highlight-2">{(queueItems.HasherQueueCount + queueItems.GeneralQueueCount + queueItems.ImageQueueCount) ?? 0}</span>
            </div>
            <div className="flex items-center gap-x-2">
              <div className="flex items-center justify-center bg-highlight-1/75 hover:bg-highlight-1 w-8 h-8 text-xl rounded-full mr-1">
                {
                  currentUser.data?.Avatar.RelativeFilepath
                    ? (<img src={`/api/v3/Image/User/Avatar/${currentUser.data?.Avatar.ID}?requestId=${currentUser.requestId}`} alt="avatar" className="w-8 h-8 rounded-full" />)
                    : currentUser.data?.Username.charAt(0)
                }
              </div>
              <span>{currentUser.data?.Username}</span>
              <Icon path={mdiChevronDown} size={0.6666} />
            </div>
            <NavLink to="settings" className={({ isActive }) => (isActive ? 'text-highlight-1' : '')} onClick={() => closeModalsAndSubmenus()}>
              <Icon path={mdiCogOutline} size={0.8333} />
            </NavLink>
          </div>
        </div>
        <div className="bg-background-nav">
          <div className="flex justify-between px-8 py-4 max-w-[120rem] w-full mx-auto">
            <div className="flex gap-x-8">
              {renderLinkMenuItem('dashboard', 'Dashboard', mdiTabletDashboard)}
              <div className={cx('transition-opacity flex gap-x-8', layoutEditMode && 'opacity-50 pointer-events-none')}>
                {renderLinkMenuItem('collection', 'Collection', mdiLayersTripleOutline)}
                <MenuItem id="utilities" text="Utilities" icon={mdiTools} onClick={() => setShowUtilitiesMenu(prev => !prev)} isHighlighted={showUtilitiesMenu} />
                <MenuItem id="actions" text="Actions" icon={mdiFormatListBulletedSquare} onClick={() => setShowActionsModal(true)} isHighlighted={showActionsModal} />
                {renderLinkMenuItem('log', 'Log', mdiTextBoxOutline)}
              </div>
            </div>
            <div className="flex gap-8 justify-end">
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
              {((checkWebuiUpdate.isSuccess && semver.gt(checkWebuiUpdate.data.Version, VITE_APPVERSION)) || checkWebuiUpdate.isFetching) && !webuiUpdateResult.isSuccess && (
                <div className="flex items-center font-semibold cursor-pointer gap-x-2.5" onClick={() => handleWebUiUpdate()}>
                  <Icon
                    path={checkWebuiUpdate.isFetching || webuiUpdateResult.isLoading ? mdiLoading : mdiDownloadCircleOutline}
                    size={1}
                    className={checkWebuiUpdate.isFetching || webuiUpdateResult.isLoading ? 'text-highlight-1' : 'text-highlight-2'}
                    spin={checkWebuiUpdate.isFetching || webuiUpdateResult.isLoading}
                  />
                  <div className="flex">
                    Web UI {webuiUpdateStatus}
                  </div>
                </div>
              )}
              {/* TODO: This maybe works, maybe doesn't. Cannot test properly. */}
              {(banStatus?.udp?.updateType === 1 && banStatus?.udp?.value) && (
                <div className="flex items-center font-semibold cursor-pointer gap-x-2.5">
                  <Icon path={mdiInformationOutline} size={1} className="text-highlight-4" />
                  AniDB UDP Ban Detected!
                </div>
              )}
              {(banStatus?.http?.updateType === 2 && banStatus?.http?.value) && (
                <div className="flex items-center font-semibold cursor-pointer gap-x-2.5">
                  <Icon path={mdiInformationOutline} size={1} className="text-highlight-4" />
                  AniDB HTTP Ban Detected!
                </div>
              )}
              <div className="flex gap-x-5">
                <ExternalLinkMenuItem url="https://discord.gg/vpeHDsg" icon={siDiscord.path} />
                <ExternalLinkMenuItem url="https://docs.shokoanime.com" icon={mdiHelpCircleOutline} />
                <ExternalLinkMenuItem url="https://github.com/ShokoAnime" icon={mdiGithub} />
              </div>
            </div>
          </div>
        </div>
        <AnimateHeight height={showUtilitiesMenu ? 'auto' : 0} className="bg-background-nav border-t border-background-border">
          <div className="max-w-[120rem] w-full mx-auto flex px-8 py-4 gap-x-8">
            {renderLinkMenuItem('utilities/unrecognized', 'Unrecognized Files', mdiTools)}
            {renderLinkMenuItem('utilities/series-without-files', 'Series Without Files', mdiTools)}
          </div>
        </AnimateHeight>
      </div>
      <ActionsModal show={showActionsModal} onClose={() => setShowActionsModal(false)} />
    </>
  );
}

export default TopNav;
