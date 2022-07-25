import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push } from '@lagunovsky/redux-react-router';
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import { Icon } from '@mdi/react';
import { mdiLoading, mdiCloseCircle } from '@mdi/js';
import { siDiscord } from 'simple-icons/icons';

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

  const openFirstRunWizard = () => dispatch(push({ pathname: 'firstrun' }));

  return (
    <React.Fragment>
      <ToastContainer
        position={toastPosition}
        autoClose={4000}
        transition={Slide}
        bodyClassName="font-bold font-open-sans"
      />
      <div className="flex h-screen w-screen">
        <div className="flex grow login-image" />
        <div className="flex flex-col flex-none p-12 items-center justify-between w-125 bg-background-nav border-l-2 border-background-border">
          <img src="logo.png" className="w-32" alt="logo" />
          <div className="flex items-center font-semibold mt-4">
            Version: {isFetching ? <Icon path={mdiLoading} spin size={1} className="ml-2 text-primary" /> : version}
          </div>
          <div className="flex flex-col grow w-full justify-center p-1">
            {!initStatus?.State && (
              <div className="flex justify-center items-center">
                <Icon path={mdiLoading} spin className="text-highlight-1" size={5} />
              </div>
            )}
            {initStatus.State === 1 && (
              <div className="flex flex-col justify-center items-center">
                <Icon path={mdiLoading} spin className="text-primary" size={4} />
                <div className="mt-4 text-xl font-semibold">Server is starting. Please wait!</div>
                <div className="mt-2 text-lg">
                  <span className="font-semibold">Status: </span>{initStatus.StartupMessage ?? 'Unknown'}
                </div>
              </div>
            )}
            {initStatus.State === 2 && (
              <React.Fragment>
                <div className="flex flex-col -mt-32">
                  <Input autoFocus id="username" value={username} label="Username" type="text" placeholder="Username" onChange={e => setUsername(e.target.value)} onKeyPress={handleKeyPress} />
                  <Input id="password" value={password} label="Password" type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} onKeyPress={handleKeyPress} className="mt-4" />
                </div>
                <Checkbox id="rememberUser" label="Remember Me" isChecked={rememberUser} onChange={e => setRememberUser(e.target.checked)} className="font-semibold mt-4" labelRight />
                <Button className="bg-primary mt-4 py-2" onClick={handleSignIn} loading={isFetchingLogin} disabled={isFetching || username === ''}>Login</Button>
              </React.Fragment>
            )}
            {initStatus.State === 3 && (
              <div className="flex flex-col justify-center items-center overflow-y-auto pb-2">
                <Icon path={mdiCloseCircle} className="text-highlight-3" size={4} />
                <div className="mt-4 text-xl font-semibold">Server startup failed!</div>
                Check the error message below
                <div className="mt-2 text-lg break-all overflow-y-auto font-open-sans font-semibold">{initStatus.StartupMessage ?? 'Unknown'}</div>
              </div>
            )}
            {initStatus.State === 4 && (
              <div className="flex flex-col -mt-32">
                <div className="flex flex-col">
                  <div className="font-semibold">First Time? We&apos;ve All Been There</div>
                  <div className="mt-4 text-justify">
                    Before Shoko can get started indexing your anime collection, you&apos;ll
                    need to go through our <span className="text-highlight-2">First Time Wizard </span>
                    and set everything up. Don&apos;t worry, it&apos;s pretty easy and only
                    takes a couple of minutes.
                  </div>
                  <div className="mt-4">
                    Click <span className="text-highlight-2">Continue</span> below to proceed.
                  </div>
                </div>
                <Button onClick={() => openFirstRunWizard()} className="bg-primary py-2 mt-4">Continue</Button>
              </div>
            )}
          </div>
          <div className="flex flex-col w-full">
            <Button className="flex bg-primary items-center justify-center py-2" onClick={() => window.open('https://discord.gg/vpeHDsg', '_blank')}>
              Get Help on <Icon path={siDiscord.path} size={0.75} className="mx-1" /> Discord
            </Button>
            <Button className="bg-primary py-2 mt-4" onClick={() => window.open('https://docs.shokoanime.com', '_blank')}>
              Documentation
            </Button>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default LoginPage;
