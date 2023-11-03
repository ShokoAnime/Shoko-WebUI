import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useRouteError } from 'react-router-dom';

import ShokoMascot from '@/../images/shoko_mascot.png';
import Button from '@/components/Input/Button';
import { useGetInitVersionQuery } from '@/core/rtkQuery/splitV3Api/initApi';
import { usePostWebuiUpdateMutation } from '@/core/rtkQuery/splitV3Api/webuiApi';
import { unsetDetails } from '@/core/slices/apiSession';

const ErrorBoundary = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const error = useRouteError() as Error; // There is no type definition provided.

  const version = useGetInitVersionQuery();
  const [webuiUpdateTrigger, webuiUpdateResult] = usePostWebuiUpdateMutation();

  const [updateChannel, setUpdateChannel] = useState<'Stable' | 'Dev'>('Stable');

  const handleLogout = () => {
    dispatch(unsetDetails());
    navigate('/webui/login');
  };

  const handleWebUiUpdate = (channel: 'Stable' | 'Dev') => {
    setUpdateChannel(channel);
    webuiUpdateTrigger(channel).unwrap().then(() => handleLogout(), err => console.error(err));
  };

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
            If crashed during an update, select&nbsp;
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
            onClick={() => handleWebUiUpdate('Stable')}
            className="px-4 py-2 drop-shadow-md"
            buttonType="primary"
            loading={updateChannel === 'Stable' && webuiUpdateResult.isLoading}
          >
            Force update to Stable Web UI
          </Button>

          {version.data?.Server.ReleaseChannel !== 'Stable' && (
            <Button
              onClick={() => handleWebUiUpdate('Dev')}
              className="px-4 py-2 drop-shadow-md"
              buttonType="primary"
              loading={updateChannel === 'Dev' && webuiUpdateResult.isLoading}
            >
              Force update to Dev Web UI
            </Button>
          )}

          <Button
            onClick={() => handleLogout()}
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
