import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import Button from '@/components/Input/Button';
import TransitionDiv from '@/components/TransitionDiv';
import { usePostAuthMutation } from '@/core/rtkQuery/splitApi/authApi';
import { useGetInitStartServerMutation, useGetInitStatusQuery } from '@/core/rtkQuery/splitV3Api/initApi';
import { setSaved as setFirstRunSaved } from '@/core/slices/firstrun';

import Footer from './Footer';

import type { RootState } from '@/core/store';

function StartServer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [pollingInterval, setPollingInterval] = useState(0);

  const [startServer] = useGetInitStartServerMutation();
  const [login] = usePostAuthMutation();
  const status = useGetInitStatusQuery(undefined, { pollingInterval });

  const user = useSelector((state: RootState) => state.firstrun.user);

  const handleNext = () => {
    setPollingInterval(0);
    dispatch(setFirstRunSaved('start-server'));
    login({
      user: user.Username,
      pass: user.Password,
      device: 'web-ui',
      rememberUser: false,
    }).unwrap().then(
      () => navigate('../import-folders'),
      error => console.error(error),
    );
  };

  const handleStart = () => {
    startServer().catch(() => {});
    setPollingInterval(500);
  };

  useEffect(() => {
    if (status.data?.State === 2 || status.data?.State === 3) setPollingInterval(0);
  }, [status.data]);

  return (
    <TransitionDiv className="flex max-w-[38rem] flex-col justify-center gap-y-8">
      <div className="text-xl font-semibold">Start Server</div>
      <div className="text-justify">
        On this page you can try and start the server, startup progress will be reported below. After the startup and
        database creation process is complete you will be able to setup import folders.
      </div>
      <div className="flex flex-col">
        <div className="flex gap-x-2">
          <span className="font-semibold">Status:</span>
          {status.data?.State === 2
            ? <span className="font-semibold">Started!</span>
            : (status.data?.StartupMessage ?? <span className="font-semibold">Not Started!</span>)}
        </div>
        <div className="mt-24 flex items-center justify-center">
          {pollingInterval === 0 && (status.isUninitialized || status.data?.State === 4) && (
            <Button onClick={() => handleStart()} buttonType="primary" className="w-64 py-2 font-semibold">
              Start Server
            </Button>
          )}
        </div>
      </div>
      <Footer
        prevDisabled={status.data?.State !== 4}
        nextDisabled={status.data?.State !== 2}
        saveFunction={handleNext}
      />
    </TransitionDiv>
  );
}

export default StartServer;
