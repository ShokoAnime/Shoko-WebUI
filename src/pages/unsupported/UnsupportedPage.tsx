import React from 'react';
import { useDispatch } from 'react-redux';

import ShokoMascot from '@/../images/shoko_mascot.png';
import Button from '@/components/Input/Button';
import Events from '@/core/events';
import { useVersionQuery } from '@/core/react-query/init/queries';
import { useUpdateWebuiMutation } from '@/core/react-query/webui/mutations';

const { VITE_MIN_SERVER_VERSION } = import.meta.env;

const UnsupportedPage = () => {
  const dispatch = useDispatch();
  const { isPending: isUpdateWebuiPending, mutate: updateWebui } = useUpdateWebuiMutation();

  const versionQuery = useVersionQuery();

  const handleLogout = () => {
    dispatch({ type: Events.AUTH_LOGOUT });
  };

  const handleWebUiUpdate = () => {
    updateWebui('Stable', {
      onSuccess: () => handleLogout(),
    });
  };

  return (
    <>
      <title>Unsupported Version | Shoko</title>
      <div className="relative flex grow items-center justify-center overflow-hidden p-6">
        <div className="z-20 flex h-full max-w-[56.4375rem] flex-col items-center justify-center gap-y-4 overflow-y-auto md:gap-y-6">
          <div className="text-2xl text-panel-text md:text-5xl">STOP!</div>
          <div className="text-2xl text-panel-text md:text-5xl">You Shall Not Pass!</div>
          <div className="flex flex-col gap-y-4">
            <div>
              It looks like you’re attempting to use a version of the Web UI that is not compatible with the version of
              Shoko Server you have installed.
            </div>
            <div>
              If you are using the daily version of Shoko Server, you should update your server to the latest daily. If
              you do not want to update your server, find the daily Web UI version which works and manually downgrade to
              it.
            </div>
            <div>
              If you are running the stable version of Shoko Server, select the&nbsp;
              <span className="font-semibold text-panel-text-important">Force Update to Stable Web UI&nbsp;</span>
              button to have Shoko download the latest stable version of the Web UI which will work with your version of
              Shoko Server.
            </div>
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
                {VITE_MIN_SERVER_VERSION}
                <br />
                Web UI Version:&nbsp;
                {versionQuery.data.WebUI?.Version}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-y-2 md:flex-row md:gap-x-4">
            <Button
              onClick={handleWebUiUpdate}
              className="px-4 py-2 drop-shadow-md"
              buttonType="primary"
              loading={isUpdateWebuiPending}
            >
              Force update to Stable Web UI
            </Button>
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
