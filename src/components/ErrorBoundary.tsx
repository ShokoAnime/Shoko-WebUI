import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouteError } from 'react-router-dom';

import ShokoMascot from '@/../images/shoko_mascot.png';
import Button from '@/components/Input/Button';
import Events from '@/core/events';
import { useVersionQuery } from '@/core/react-query/init/queries';
import { useUpdateWebuiMutation } from '@/core/react-query/webui/mutations';
import useEventCallback from '@/hooks/useEventCallback';

const ErrorBoundary = () => {
  const dispatch = useDispatch();
  const error = useRouteError() as Error; // There is no type definition provided.

  const versionQuery = useVersionQuery();
  const { isPending: isUpdateWebuiPending, mutate: updateWebui } = useUpdateWebuiMutation();

  const [updateChannel, setUpdateChannel] = useState<'Stable' | 'Dev'>('Stable');

  const handleLogout = useEventCallback(() => {
    dispatch({ type: Events.AUTH_LOGOUT });
  });

  const handleWebUiUpdate = useEventCallback((channel: 'Stable' | 'Dev') => {
    setUpdateChannel(channel);
    updateWebui(channel, {
      onSuccess: () => handleLogout(),
    });
  });

  const handleStableWebUiUpdate = useEventCallback(() => handleWebUiUpdate('Stable'));
  const handleDevWebUiUpdate = useEventCallback(() => handleWebUiUpdate('Dev'));

  return (
    <div className="relative flex grow items-center justify-center overflow-hidden p-8">
      <div className="z-20 flex h-full max-w-[56.4375rem] flex-col items-center justify-center gap-y-4 overflow-y-auto md:gap-y-8">
        <div className="text-4xl text-panel-text md:text-7xl">Congratulations!</div>
        <div className="text-2xl text-panel-text md:text-5xl">You Broke The Web UI!</div>
        <pre className="flex max-h-[25rem] max-w-full flex-col overflow-y-auto whitespace-pre-wrap rounded-lg border border-panel-border bg-panel-input p-4 md:p-8">
          The information below is absolutely (maybe) useless!
          <br />
          <br />
          {error.stack}
        </pre>
        <div className="flex flex-col gap-y-4">
          <div>Lets get you back into the Web UI.</div>
          <div>
            If you are seeing this page after updating, select&nbsp;
            <span className="font-semibold text-panel-text-important">Force Update to Stable Web UI</span>
            , otherwise select&nbsp;
            <span className="font-semibold text-panel-text-important">Logout of Web UI</span>
            &nbsp;to clear local storage.
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
        </div>
        <div className="flex flex-col gap-y-2 md:flex-row md:gap-x-4">
          <Button
            onClick={handleStableWebUiUpdate}
            className="px-4 py-2 drop-shadow-md"
            buttonType="primary"
            loading={updateChannel === 'Stable' && isUpdateWebuiPending}
          >
            Force update to Stable Web UI
          </Button>

          {versionQuery.data?.Server.ReleaseChannel !== 'Stable' && (
            <Button
              onClick={handleDevWebUiUpdate}
              className="px-4 py-2 drop-shadow-md"
              buttonType="primary"
              loading={updateChannel === 'Dev' && isUpdateWebuiPending}
            >
              Force update to Dev Web UI
            </Button>
          )}

          <Button
            onClick={handleLogout}
            className="px-4 py-2 drop-shadow-md"
            buttonType="primary"
          >
            Logout of Web UI
          </Button>
        </div>
      </div>

      <img
        src={ShokoMascot}
        alt="mascot"
        className="absolute -bottom-40 -right-36 z-10 opacity-30"
      />
    </div>
  );
};

export default ErrorBoundary;
