import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ShokoMascot from '@/../images/shoko_mascot.png';
import Button from '@/components/Input/Button';
import Events from '@/core/events';
import { useVersionQuery } from '@/core/react-query/init/queries';
import { useUpdateWebuiMutation } from '@/core/react-query/webui/mutations';
import { useWebuiUpdateCheckQuery } from '@/core/react-query/webui/queries';
import {
  getMaximumServerVersion,
  getMinimumServerVersion,
  getServerSupport,
  isWebUiNewServerCompatible,
} from '@/core/util';
import useNavigateVoid from '@/hooks/useNavigateVoid';

import type { RootState } from '@/core/store';
import type { ReleaseChannelType } from '@/core/types/api/init';

const UnsupportedPage = () => {
  const dispatch = useDispatch();
  const { isPending: isUpdateWebuiPending, mutate: updateWebui } = useUpdateWebuiMutation();

  const versionQuery = useVersionQuery();

  const navigate = useNavigateVoid();
  const hasApiKey = useSelector((state: RootState) => state.apiSession.apikey !== '');
  const [updateChannel, setUpdateChannel] = useState<ReleaseChannelType>('Stable');

  const isTooNew = !!versionQuery.data && getServerSupport(versionQuery.data.Server.Version) === 'tooNew';
  const canUseDev = versionQuery.data?.Server.ReleaseChannel !== 'Stable';

  // Only offer a channel if its latest release actually supports this server
  const stableCheck = useWebuiUpdateCheckQuery({ channel: 'Stable', force: false }, isTooNew && hasApiKey);
  const devCheck = useWebuiUpdateCheckQuery({ channel: 'Dev', force: false }, isTooNew && hasApiKey && canUseDev);
  const stableCompatible = !!stableCheck.data && isWebUiNewServerCompatible(stableCheck.data.Version);
  const devCompatible = canUseDev && !!devCheck.data && isWebUiNewServerCompatible(devCheck.data.Version);
  const isChecking = stableCheck.isPending || (canUseDev && devCheck.isPending);

  let tooNewMessage =
    'No released Web UI supports your version of Shoko Server yet. Check back later, or downgrade your server to a supported version.';
  if (!hasApiKey) tooNewMessage = 'Log in to check for a Web UI update that supports your server.';
  else if (isChecking) tooNewMessage = 'Checking for a compatible Web UI update...';
  else if (stableCompatible || devCompatible) {
    tooNewMessage = 'A compatible Web UI is available. Select an update option below to have Shoko download it.';
  }

  const handleLogout = () => {
    dispatch({ type: Events.AUTH_LOGOUT });
  };

  const handleWebUiUpdate = (channel: ReleaseChannelType) => {
    setUpdateChannel(channel);
    updateWebui(channel, {
      onSuccess: () => handleLogout(),
    });
  };

  return (
    <>
      <title>Unsupported Version | Shoko</title>
      <div className="relative flex grow items-center justify-center overflow-hidden p-6">
        <div className="z-20 flex h-full max-w-225.75 flex-col items-center justify-center gap-y-4 overflow-y-auto md:gap-y-6">
          <div className="text-2xl text-panel-text md:text-5xl">STOP!</div>
          <div className="text-2xl text-panel-text md:text-5xl">You Shall Not Pass!</div>
          <div className="flex flex-col gap-y-4">
            {isTooNew
              ? (
                <>
                  <div>
                    This version of the Web UI is too old for the version of Shoko Server you have installed and will
                    not work correctly.
                  </div>
                  <div>{tooNewMessage}</div>
                </>
              )
              : (
                <>
                  <div>
                    It looks like you’re attempting to use a version of the Web UI that is not compatible with the
                    version of Shoko Server you have installed.
                  </div>
                  <div>
                    If you are using the daily version of Shoko Server, you should update your server to the latest
                    daily. If you do not want to update your server, find the daily Web UI version which works and
                    manually downgrade to it.
                  </div>
                  <div>
                    If you are running the stable version of Shoko Server, select the&nbsp;
                    <span className="font-semibold text-panel-text-important">Force Update to Stable Web UI&nbsp;</span>
                    button to have Shoko download the latest stable version of the Web UI which will work with your
                    version of Shoko Server.
                  </div>
                </>
              )}
            <div>
              Still need help? Hop on our&nbsp;
              <a
                href="https://discord.gg/vpeHDsg"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-panel-text-primary"
              >
                Discord
              </a>
              &nbsp;server and provide the above error.
            </div>
            {versionQuery.data && (
              <div>
                Server Version:&nbsp;
                {versionQuery.data.Server.Version}
                <br />
                Minimum Supported Server Version:&nbsp;
                {getMinimumServerVersion()}
                <br />
                Supported Server Versions Below:&nbsp;
                {getMaximumServerVersion()}
                <br />
                Web UI Version:&nbsp;
                {versionQuery.data.WebUI?.Version}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-y-2 md:flex-row md:gap-x-4">
            {isTooNew
              ? (
                <>
                  {!hasApiKey && (
                    <Button
                      onClick={() => navigate('/webui/login')}
                      className="px-4 py-2 drop-shadow-md"
                      buttonType="primary"
                    >
                      Go to login
                    </Button>
                  )}
                  {stableCompatible && (
                    <Button
                      onClick={() => handleWebUiUpdate('Stable')}
                      className="px-4 py-2 drop-shadow-md"
                      buttonType="primary"
                      loading={updateChannel === 'Stable' && isUpdateWebuiPending}
                    >
                      Update to Stable Web UI
                    </Button>
                  )}
                  {devCompatible && (
                    <Button
                      onClick={() => handleWebUiUpdate('Dev')}
                      className="px-4 py-2 drop-shadow-md"
                      buttonType="primary"
                      loading={updateChannel === 'Dev' && isUpdateWebuiPending}
                    >
                      Update to Dev Web UI
                    </Button>
                  )}
                </>
              )
              : (
                <Button
                  onClick={() => handleWebUiUpdate('Stable')}
                  className="px-4 py-2 drop-shadow-md"
                  buttonType="primary"
                  loading={isUpdateWebuiPending}
                >
                  Force update to Stable Web UI
                </Button>
              )}
          </div>
        </div>
        <img
          src={ShokoMascot}
          alt="mascot"
          className="absolute -bottom-40 -right-36 z-10 opacity-30"
        />
      </div>
    </>
  );
};

export default UnsupportedPage;
