import React from 'react';
import { useDispatch } from 'react-redux';

import ShokoMascot from '@/../images/shoko_mascot.png';
import Button from '@/components/Input/Button';
import Events from '@/core/events';
import { useUpdateWebuiMutation } from '@/core/react-query/webui/mutations';
import useEventCallback from '@/hooks/useEventCallback';

const UnsupportedPage = () => {
  const dispatch = useDispatch();
  const { isPending: isUpdateWebuiPending, mutate: updateWebui } = useUpdateWebuiMutation();

  const handleLogout = useEventCallback(() => {
    dispatch({ type: Events.AUTH_LOGOUT });
  });

  const handleWebUiUpdate = useEventCallback(() => {
    updateWebui('Stable', {
      onSuccess: () => handleLogout(),
    });
  });

  const handleStableWebUiUpdate = useEventCallback(() => handleWebUiUpdate());

  return (
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
            Select the&nbsp;
            <span className="font-semibold text-panel-text-important">Force Update to Stable Web UI</span>
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
        </div>
        <div className="flex flex-col gap-y-2 md:flex-row md:gap-x-4">
          <Button
            onClick={handleStableWebUiUpdate}
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
  );
};

export default UnsupportedPage;
