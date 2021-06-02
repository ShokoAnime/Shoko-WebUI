import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleNotch, faTimesCircle, faGlobe,
} from '@fortawesome/free-solid-svg-icons';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import { uiVersion } from '../../core/util';
import Button from '../../components/Input/Button';
import Input from '../../components/Input/Input';
import Checkbox from '../../components/Input/Checkbox';

const UI_VERSION = uiVersion();

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
        <div className="flex flex-col p-5 mt-16 items-center justify-between" style={{ width: '41rem' }}>
          <img src="logo.png" className="w-32" alt="logo" />
          <div className="flex flex-col flex-grow w-full px-10 justify-center">
            {!initStatus?.State && (
              <div className="flex justify-center items-center">
                <FontAwesomeIcon icon={faCircleNotch} spin className="color-highlight-2 text-6xl2" />
              </div>
            )}
            {initStatus.State === 1 && (
              <div className="flex flex-col justify-center items-center">
                <FontAwesomeIcon icon={faCircleNotch} spin className="color-highlight-2 text-6xl2" />
                <div className="mt-8 text-3xl">Server is starting. Please wait!</div>
                <div className="mt-2 text-lg">
                  <span className="font-mulish font-semibold">Status: </span>{initStatus.StartupMessage ?? 'Unknown'}
                </div>
              </div>
            )}
            {initStatus.State === 2 && (
              <React.Fragment>
                <div className="flex flex-col">
                  <Input autoFocus id="username" value={username} label="Username" type="text" placeholder="Username" onChange={e => setUsername(e.target.value)} onKeyPress={handleKeyPress} />
                  <Input id="password" value={password} label="Password" type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} onKeyPress={handleKeyPress} className="mt-12" />
                </div>
                <div className="flex justify-between items-center mt-16">
                  <Checkbox id="rememberUser" label="Remember Me" isChecked={rememberUser} onChange={e => setRememberUser(e.target.value)} className="font-bold text-lg" labelRight />
                  <Button className="bg-color-highlight-1 py-3 px-28 text-lg font-bold" onClick={handleSignIn} loading={isFetchingLogin} disabled={isFetching || username === ''}>Log In</Button>
                </div>
              </React.Fragment>
            )}
            {initStatus.State === 3 && (
              <div className="flex flex-col justify-center items-center overflow-y-auto pb-2">
                <FontAwesomeIcon icon={faTimesCircle} className="color-danger text-6xl2" />
                <div className="mt-3 text-3xl">Server startup failed!</div>
                Check the error message below
                <div className="mt-2 text-lg break-all overflow-y-auto">{initStatus.StartupMessage ?? 'Unknown'}</div>
              </div>
            )}
            {initStatus.State === 4 && (
              <div className="flex flex-col">
                <div className="flex flex-col">
                  <div className="font-semibold text-lg">First Time? We&apos;ve All Been There</div>
                  <div className="mt-6 font-mulish text-justify">
                    Before Shoko can get started indexing your anime collection, you&apos;ll
                    need to go through our <span className="color-highlight-1">First Time Wizard </span>
                    and set everything up. Don&apos;t worry, it&apos;s pretty easy and only
                    takes a couple of minutes.
                  </div>
                  <div className="mt-6 font-mulish">
                    Click <span className="color-highlight-1">Continue</span> below to proceed.
                  </div>
                </div>
                <div className="flex justify-center items-center flex-grow mt-32">
                  <Button onClick={() => openFirstRunWizard()} className="flex bg-color-highlight-1 px-24 py-5 font-semibold">Continue</Button>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-between w-full px-10">
            <div className="flex items-center">
              Server Version: {isFetching ? <FontAwesomeIcon icon={faCircleNotch} spin className="mx-2 color-highlight-2" /> : `${version} `}
              | UI Version: {UI_VERSION}
            </div>
            <div className="flex items-center">
              Get Support:
              <Button className="color-highlight-1 ml-4 text-xl2" onClick={() => window.open('https://discord.gg/vpeHDsg', '_blank')}>
                <FontAwesomeIcon icon={faDiscord} />
              </Button>
              <Button className="color-highlight-1 ml-4 text-xl2" onClick={() => window.open('https://docs.shokoanime.com', '_blank')}>
                <FontAwesomeIcon icon={faGlobe} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default LoginPage;
