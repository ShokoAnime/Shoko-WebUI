import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push } from '@lagunovsky/redux-react-router';

import { RootState } from '../../core/store';
import { setSaved as setFirstRunSaved } from '../../core/slices/firstrun';
import Footer from './Footer';
import Button from '../../components/Input/Button';
import TransitionDiv from '../../components/TransitionDiv';

import { useGetInitStartServerMutation, useGetInitStatusQuery } from '../../core/rtkQuery/splitV3Api/initApi';
import { usePostAuthMutation } from '../../core/rtkQuery/splitApi/authApi';

function StartServer() {
  const dispatch = useDispatch();

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
      () => dispatch(push('import-folders')),
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
    <TransitionDiv className="flex flex-col justify-center max-w-[40rem] px-8">
      <div className="font-semibold">Start Server</div>
      <div className="mt-9 text-justify">
        On this page you can try and start the server, startup progress will be reported below.
        After the startup and database creation process is complete you will be able to setup
        import folders.
      </div>
      <div className="flex flex-col my-9">
        <div className="flex">
          <span className="font-semibold mr-2">Status:</span>
          {status.data?.State === 2 ? (<span className="font-semibold">Started!</span>) : (status.data?.StartupMessage ?? <span className="font-semibold">Not Started!</span>)}
        </div>
        <div className="flex justify-center items-center mt-24">
          {pollingInterval === 0 && (status.isUninitialized || status.data?.State === 4) && (
            <Button onClick={() => handleStart()} className="bg-highlight-2 py-2 w-64">Start Server</Button>
          )}
        </div>
      </div>
      <Footer prevDisabled={status.data?.State !== 4} nextDisabled={status.data?.State !== 2} saveFunction={handleNext} />
    </TransitionDiv>
  );
}

export default StartServer;
