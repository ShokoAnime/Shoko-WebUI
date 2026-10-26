import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router';

import Button from '@/components/Input/Button';
import TransitionDiv from '@/components/TransitionDiv';
import { useLoginMutation } from '@/core/react-query/auth/mutations';
import { useCompleteSetupMutation } from '@/core/react-query/init/mutations';
import { useServerStatusQuery } from '@/core/react-query/init/queries';
import { setSaved as setFirstRunSaved } from '@/core/slices/firstrun';
import { useDispatch, useSelector } from '@/core/store';
import useNavigateVoid from '@/hooks/useNavigateVoid';

import Footer from './Footer';

type OutletContextType = {
  setIsPersistent: (value: boolean) => void;
};

const StartServer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigateVoid();

  const [pollingInterval, setPollingInterval] = useState(0);

  const { setIsPersistent } = useOutletContext<OutletContextType>();
  const { mutate: completeSetup } = useCompleteSetupMutation();
  const { mutate: login } = useLoginMutation();
  const serverStatusQuery = useServerStatusQuery(pollingInterval);

  const user = useSelector(state => state.firstrun.user);

  const handleNext = () => {
    setPollingInterval(0);
    dispatch(setFirstRunSaved('start-server'));
    login(
      {
        user: user.Username,
        pass: user.Password,
        device: 'web-ui',
        rememberUser: false,
      },
      {
        onSuccess: () => navigate('../managed-folders'),
      },
    );
  };

  const handleStart = () => {
    setIsPersistent(true);
    completeSetup();
    setPollingInterval(500);
  };

  useEffect(() => {
    if (serverStatusQuery.data?.State === 'Started' || serverStatusQuery.data?.State === 'Failed') {
      // oxlint-disable-next-line react/set-state-in-effect -- stop polling once the server has started or failed
      setPollingInterval(0);
    }
  }, [serverStatusQuery.data]);

  return (
    <>
      <title>First Run &gt; Start Server | Shoko</title>
      <TransitionDiv className="flex max-w-152 flex-col justify-center gap-y-6">
        <div className="text-xl font-semibold">Start Server</div>
        <div className="text-justify">
          On this page you can try and start the server, startup progress will be reported below. After the startup and
          database creation process is complete you will be able to setup managed folders.
        </div>
        <div className="flex flex-col">
          <div className="flex gap-x-2">
            <span className="font-semibold">Status:</span>
            {serverStatusQuery.data?.State === 'Started'
              ? <span className="font-semibold">Started!</span>
              : (serverStatusQuery.data?.StartupMessage ?? <span className="font-semibold">Not Started!</span>)}
          </div>
          {serverStatusQuery.data?.State === 'Failed' && (
            <div className="mt-6 flex flex-col gap-y-4">
              <div className="text-justify">
                <span className="font-semibold text-panel-text-danger">The server failed to start.&nbsp;</span>
                If a plugin is the cause, you can disable, update or uninstall it under Manage Plugins. The status page
                shows the full message and lets you restart the server once the problem is fixed.
              </div>
              <div className="flex justify-center gap-x-3 font-semibold">
                <Button onClick={() => navigate('/webui/status')} buttonType="secondary" className="w-48 py-2">
                  Server Status
                </Button>
                <Button onClick={() => navigate('/webui/plugin-management')} buttonType="primary" className="w-48 py-2">
                  Manage Plugins
                </Button>
              </div>
            </div>
          )}
          <div className="mt-24 flex items-center justify-center">
            {pollingInterval === 0
              && ((!serverStatusQuery.isSuccess && !serverStatusQuery.isError)
                || serverStatusQuery.data?.State === 'Waiting')
              && (
                <Button onClick={() => handleStart()} buttonType="primary" className="w-64 py-2 font-semibold">
                  Start Server
                </Button>
              )}
          </div>
        </div>
        <Footer
          prevDisabled={serverStatusQuery.data?.State !== 'Waiting'}
          nextDisabled={serverStatusQuery.data?.State !== 'Started'}
          saveFunction={handleNext}
        />
      </TransitionDiv>
    </>
  );
};

export default StartServer;
