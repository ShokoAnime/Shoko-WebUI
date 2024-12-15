import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useOutletContext } from 'react-router';

import Button from '@/components/Input/Button';
import TransitionDiv from '@/components/TransitionDiv';
import { useLoginMutation } from '@/core/react-query/auth/mutations';
import { useStartServerMutation } from '@/core/react-query/init/mutations';
import { useServerStatusQuery } from '@/core/react-query/init/queries';
import { setSaved as setFirstRunSaved } from '@/core/slices/firstrun';
import useNavigateVoid from '@/hooks/useNavigateVoid';

import Footer from './Footer';

import type { RootState } from '@/core/store';

type OutletContextType = {
  setIsPersistent: (value: boolean) => void;
};

function StartServer() {
  const dispatch = useDispatch();
  const navigate = useNavigateVoid();

  const [pollingInterval, setPollingInterval] = useState(0);

  const { setIsPersistent } = useOutletContext<OutletContextType>();
  const { mutate: startServer } = useStartServerMutation();
  const { mutate: login } = useLoginMutation();
  const serverStatusQuery = useServerStatusQuery(pollingInterval);

  const user = useSelector((state: RootState) => state.firstrun.user);

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
        onSuccess: () => navigate('../import-folders'),
      },
    );
  };

  const handleStart = () => {
    setIsPersistent(true);
    startServer();
    setPollingInterval(500);
  };

  useEffect(() => {
    if (serverStatusQuery.data?.State === 2 || serverStatusQuery.data?.State === 3) setPollingInterval(0);
  }, [serverStatusQuery.data]);

  return (
    <>
      <title>First Run &gt; Start Server | Shoko</title>
      <TransitionDiv className="flex max-w-[38rem] flex-col justify-center gap-y-6">
        <div className="text-xl font-semibold">Start Server</div>
        <div className="text-justify">
          On this page you can try and start the server, startup progress will be reported below. After the startup and
          database creation process is complete you will be able to setup import folders.
        </div>
        <div className="flex flex-col">
          <div className="flex gap-x-2">
            <span className="font-semibold">Status:</span>
            {serverStatusQuery.data?.State === 2
              ? <span className="font-semibold">Started!</span>
              : (serverStatusQuery.data?.StartupMessage ?? <span className="font-semibold">Not Started!</span>)}
          </div>
          <div className="mt-24 flex items-center justify-center">
            {pollingInterval === 0
              && ((!serverStatusQuery.isSuccess && !serverStatusQuery.isError) || serverStatusQuery.data?.State === 4)
              && (
                <Button onClick={() => handleStart()} buttonType="primary" className="w-64 py-2 font-semibold">
                  Start Server
                </Button>
              )}
          </div>
        </div>
        <Footer
          prevDisabled={serverStatusQuery.data?.State !== 4}
          nextDisabled={serverStatusQuery.data?.State !== 2}
          saveFunction={handleNext}
        />
      </TransitionDiv>
    </>
  );
}

export default StartServer;
