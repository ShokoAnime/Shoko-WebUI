import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import { setSaved as setFirstRunSaved } from '../../core/slices/firstrun';
import Footer from './Footer';
import Button from '../../components/Input/Button';
import TransitionDiv from '../../components/TransitionDiv';

function StartServer() {
  const dispatch = useDispatch();

  const status = useSelector((state: RootState) => state.firstrun.serverStatus);
  const user = useSelector((state: RootState) => state.firstrun.user);

  const handleNext = () => {
    dispatch({ type: Events.STOP_API_POLLING, payload: { type: 'server-status' } });

    dispatch({
      type: Events.AUTH_LOGIN,
      payload: {
        user: user.Username,
        pass: user.Password,
        device: 'web-ui',
        redirect: false,
      },
    });
  };

  const handleSave = () => {
    dispatch({ type: Events.FIRSTRUN_START_SERVER });
    dispatch(setFirstRunSaved('start-server'));
  };

  return (
    <TransitionDiv className="flex flex-col justify-center px-96">
      <div className="font-semibold text-lg">Start Server</div>
      <div className="font-mulish font-semibold mt-10 text-justify">
        On this page you can try and start the server, startup progress will be reported below.
        After the startup and database creation process is complete you will be able to setup
        import folders.
      </div>
      <div className="flex flex-col my-10">
        <div className="flex">
          <span className="font-bold mr-2">Status:</span>
          {status.State === 2 ? (<span className="font-semibold">Started!</span>) : (status.StartupMessage || <span className="font-semibold">Not Started!</span>)}
        </div>
        <div className="flex justify-center items-center mt-24">
          {status.State === 4 && (
            <Button onClick={() => handleSave()} className="bg-highlight-2 py-2 w-64">Start Server</Button>
          )}
        </div>
      </div>
      <Footer nextPage="import-folders" prevDisabled={status.State !== 4} nextDisabled={status.State !== 2} saveFunction={handleNext} />
    </TransitionDiv>
  );
}

export default StartServer;
