import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useRouteError } from 'react-router-dom';

import Button from '@/components/Input/Button';
import { usePostWebuiUpdateMutation } from '@/core/rtkQuery/splitV3Api/webuiApi';
import { unsetDetails } from '@/core/slices/apiSession';

const ErrorBoundary = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const error = useRouteError() as Error; // There is no type definition provided.

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
    <div className="flex grow items-center justify-center p-8">
      <div className="flex max-w-[56.4375rem] flex-col items-center gap-y-8">
        <div className="text-7xl text-panel-text">Congratulations!</div>
        <div className="text-5xl text-panel-text">You Broke The Web UI!</div>
        <pre className="flex max-h-[25rem] max-w-full flex-col overflow-y-auto whitespace-pre-wrap rounded-lg border border-panel-border bg-panel-input p-8">
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
        <div className="flex gap-x-4">
          <Button
            onClick={() => handleWebUiUpdate('Stable')}
            className="px-4 py-2 drop-shadow-md"
            buttonType="primary"
            loading={updateChannel === 'Stable' && webuiUpdateResult.isLoading}
          >
            Force update to Stable Web UI
          </Button>

          <Button
            onClick={() => handleWebUiUpdate('Dev')}
            className="px-4 py-2 drop-shadow-md"
            buttonType="primary"
            loading={updateChannel === 'Dev' && webuiUpdateResult.isLoading}
          >
            Force update to Dev Web UI
          </Button>

          <Button
            onClick={() => handleLogout()}
            className="px-4 py-2 drop-shadow-md"
            buttonType="primary"
          >
            Logout of Web UI
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;
