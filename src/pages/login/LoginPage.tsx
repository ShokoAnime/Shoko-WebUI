import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import { Icon } from '@mdi/react';
import { mdiLoading, mdiDiscord, mdiCloseCircle } from '@mdi/js';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import Button from '../../components/Input/Button';
import Input from '../../components/Input/Input';
import Checkbox from '../../components/Input/Checkbox';

function LoginPage() {
  const dispatch = useDispatch();

  const initStatus = useSelector((state: RootState) => state.firstrun.serverStatus);
  const isFetching = useSelector((state: RootState) => state.fetching.serverVersion);
  const isFetchingLogin = useSelector((state: RootState) => state.fetching.login);
  const rememberOldUser = useSelector((state: RootState) => state.apiSession.rememberUser);
  const toastPosition = useSelector(
    (state: RootState) => state.webuiSettings.webui_v2.toastPosition,
  );
  const version = useSelector((state: RootState) => state.jmmVersion);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberUser, setRememberUser] = useState(false);

  useEffect(() => {
    dispatch({ type: Events.START_API_POLLING, payload: { type: 'server-status' } });
    dispatch({ type: Events.SERVER_VERSION });

    if (rememberOldUser) {
      dispatch(push({ pathname: '/' }));
    }

    return function cleanup() {
      dispatch({ type: Events.STOP_API_POLLING, payload: { type: 'server-status' } });
    };
  }, []);

  useEffect(() => {
    if (initStatus.State !== 1) {
      dispatch({ type: Events.STOP_API_POLLING, payload: { type: 'server-status' } });
    }
  }, [initStatus]);

  const handleSignIn = () => {
    if (!username) return;

    dispatch({
      type: Events.AUTH_LOGIN,
      payload: {
        user: username,
        pass: password,
        device: 'webui',
        rememberUser,
      },
    });
  };

  const handleKeyPress = (event: any) => {
    if (event.key === 'Enter') {
      handleSignIn();
    }
  };

  const openFirstRunWizard = () => dispatch(push({ pathname: '/firstrun/acknowledgement' }));

  return (
    <React.Fragment>
      <ToastContainer
        position={toastPosition}
        autoClose={4000}
        transition={Slide}
        bodyClassName="font-bold font-exo2"
      />
      <div className="flex h-screen w-screen">
        <div className="flex flex-grow login-image" />
        <div className="flex flex-col px-13 items-center justify-between w-125 bg-background-nav">
          <img src="logo.png" className="w-32 mt-16" alt="logo" />
          <div className="flex items-center font-mulish font-semibold mt-6">
            Version: {isFetching ? <Icon path={mdiLoading} spin size={1} className="ml-2 text-highlight-1" /> : version}
          </div>
          <div className="flex flex-col flex-grow w-full justify-center">
            {!initStatus?.State && (
              <div className="flex justify-center items-center">
                <Icon path={mdiLoading} spin className="text-highlight-1" size={5} />
              </div>
            )}
            {initStatus.State === 1 && (
              <div className="flex flex-col justify-center items-center">
                <Icon path={mdiLoading} spin className="text-highlight-1" size={4} />
                <div className="mt-4 text-xl font-semibold">Server is starting. Please wait!</div>
                <div className="mt-2 text-lg">
                  <span className="font-mulish font-semibold">Status: </span>{initStatus.StartupMessage ?? 'Unknown'}
                </div>
              </div>
            )}
            {initStatus.State === 2 && (
              <React.Fragment>
                <div className="flex flex-col -mt-32">
                  <Input autoFocus id="username" value={username} label="Username" type="text" placeholder="Username" onChange={e => setUsername(e.target.value)} onKeyPress={handleKeyPress} />
                  <Input id="password" value={password} label="Password" type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} onKeyPress={handleKeyPress} className="mt-7" />
                </div>
                <Checkbox id="rememberUser" label="Remember Me" isChecked={rememberUser} onChange={e => setRememberUser(e.target.checked)} className="font-bold text-lg mt-7" labelRight />
                <Button className="bg-highlight-1 mt-14 py-2" onClick={handleSignIn} loading={isFetchingLogin} disabled={isFetching || username === ''}>Login</Button>
              </React.Fragment>
            )}
            {initStatus.State === 3 && (
              <div className="flex flex-col justify-center items-center overflow-y-auto pb-2">
                <Icon path={mdiCloseCircle} className="text-highlight-3" size={4} />
                <div className="mt-4 text-xl font-semibold">Server startup failed!</div>
                Check the error message below
                <div className="mt-2 text-lg break-all overflow-y-auto font-mulish font-semibold">{initStatus.StartupMessage ?? 'Unknown'}</div>
              </div>
            )}
            {initStatus.State === 4 && (
              <div className="flex flex-col -mt-32">
                <div className="flex flex-col font-semibold">
                  <div className="text-lg">First Time? We&apos;ve All Been There</div>
                  <div className="mt-10 font-mulish text-justify">
                    Before Shoko can get started indexing your anime collection, you&apos;ll
                    need to go through our <span className="text-highlight-2">First Time Wizard </span>
                    and set everything up. Don&apos;t worry, it&apos;s pretty easy and only
                    takes a couple of minutes.
                  </div>
                  <div className="mt-6 font-mulish">
                    Click <span className="text-highlight-2">Continue</span> below to proceed.
                  </div>
                </div>
                <Button onClick={() => openFirstRunWizard()} className="bg-highlight-1 mt-20">Continue</Button>
              </div>
            )}
          </div>
          <div className="flex flex-col w-full pb-13">
            <Button className="bg-highlight-2 py-2" onClick={() => window.open('https://docs.shokoanime.com', '_blank')}>
              Documentation
            </Button>
            <Button className="flex bg-highlight-2 mt-5 items-center justify-center py-2" onClick={() => window.open('https://discord.gg/vpeHDsg', '_blank')}>
              Get help on <Icon path={mdiDiscord} size={0.75} className="mx-1" /> Discord
            </Button>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default LoginPage;
