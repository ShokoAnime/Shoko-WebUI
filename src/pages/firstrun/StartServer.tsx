import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../../core/store';
import { setSaved as setFirstRunSaved } from '../../core/slices/firstrun';
import Footer from './Footer';
import Button from '../../components/Input/Button';
import TransitionDiv from '../../components/TransitionDiv';

import { useGetInitStartServerMutation, useLazyGetInitStatusQuery } from '../../core/rtkQuery/initApi';
import { usePostAuthMutation } from '../../core/rtkQuery/authApi';

function StartServer() {
  const dispatch = useDispatch();

  const [startServer] = useGetInitStartServerMutation();
  const [login] = usePostAuthMutation();
  const [statusTrigger, statusResult] = useLazyGetInitStatusQuery();

  const user = useSelector((state: RootState) => state.firstrun.user);

  const handleNext = async () => {
    statusTrigger().updateSubscriptionOptions({ pollingInterval: 0 });
    dispatch(setFirstRunSaved('start-server'));
    await login({
      user: user.Username,
      pass: user.Password,
      device: 'web-ui',
      rememberUser: false,
    });
  };

  const handleStart = () => {
    startServer().then(() => {}, () => {});
    statusTrigger().updateSubscriptionOptions({ pollingInterval: 500 });
  };

  useEffect(() => {
    if (statusResult.data?.State === 2 || statusResult.data?.State === 3) statusTrigger().updateSubscriptionOptions({ pollingInterval: 0 });
  }, [statusResult.data]);

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
          {statusResult.data?.State === 2 ? (<span className="font-semibold">Started!</span>) : (statusResult.data?.StartupMessage ?? <span className="font-semibold">Not Started!</span>)}
        </div>
        <div className="flex justify-center items-center mt-24">
          {(statusResult.isUninitialized || statusResult.data?.State === 4) && (
            <Button onClick={() => handleStart()} className="bg-highlight-2 py-2 w-64">Start Server</Button>
          )}
        </div>
      </div>
      <Footer nextPage="import-folders" prevDisabled={statusResult.data?.State !== 4} nextDisabled={statusResult.data?.State !== 2} saveFunction={handleNext} />
    </TransitionDiv>
  );
}

export default StartServer;
