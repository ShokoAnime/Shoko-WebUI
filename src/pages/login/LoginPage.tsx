import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push, replace } from '@lagunovsky/redux-react-router';
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import { Icon } from '@mdi/react';
import { mdiLoading, mdiCloseCircle } from '@mdi/js';
import { siDiscord } from 'simple-icons/icons';

import { RootState } from '../../core/store';
import Button from '../../components/Input/Button';
import Input from '../../components/Input/Input';
import Checkbox from '../../components/Input/Checkbox';
import ShokoIcon from '../../components/ShokoIcon';

import { useGetInitVersionQuery, useGetInitStatusQuery } from '../../core/rtkQuery/splitV3Api/initApi';
import { usePostAuthMutation } from '../../core/rtkQuery/splitApi/authApi';

function LoginPage() {
  const dispatch = useDispatch();

  const apiSession = useSelector((state: RootState) => state.apiSession);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberUser, setRememberUser] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(500);

  const version = useGetInitVersionQuery();
  const [login, { isLoading: isFetchingLogin }] = usePostAuthMutation();
  const status = useGetInitStatusQuery(undefined, { pollingInterval });

  useEffect(() => {
    if (!status.data) setPollingInterval(500);
    else if (status.data?.State !== 1) setPollingInterval(0);

    if (status.data?.State === 2 && apiSession.rememberUser && apiSession.apikey !== '') {
      dispatch(replace({ pathname: '/' }));
    }
  }, [status.data]);

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!username) return;

    login({
      user: username,
      pass: password,
      device: 'web-ui',
      rememberUser: rememberUser,
    }).unwrap().then(() => dispatch(push('/')), error => console.error(error));
  };

  const openFirstRunWizard = () => dispatch(push({ pathname: 'firstrun' }));

  return (
    <React.Fragment>
      <ToastContainer
        position={'bottom-right'}
        autoClose={4000}
        transition={Slide}
        bodyClassName="font-semibold font-open-sans"
        className="mt-20 !w-96"
        closeButton={false}
        icon={false}
        hideProgressBar={true}
      />
      <div className="flex h-screen w-screen">
        <div className="flex grow login-image" />
        <div className="flex flex-col flex-none p-12 items-center justify-between w-125 bg-background-nav border-l-2 border-background-border">
          <ShokoIcon className="w-32" />
          <div className="flex items-center font-semibold mt-4">
            Version: {version.isFetching || !version.data ?
              <Icon path={mdiLoading} spin size={1} className="ml-2 text-highlight-1" /> :
            version.data.Server.ReleaseChannel !== 'Stable' ?
              `${version.data.Server.Version}-${version.data.Server.ReleaseChannel} (${version.data.Server.Commit?.slice(0, 7)})` :
              version.data.Server.Version
            }
          </div>
          <div className="flex flex-col grow w-full justify-center p-1">
            {!status.data?.State && (
              <div className="flex justify-center items-center">
                <Icon path={mdiLoading} spin className="text-highlight-1" size={5} />
              </div>
            )}
            {status.data?.State === 1 && (
              <div className="flex flex-col justify-center items-center">
                <Icon path={mdiLoading} spin className="text-highlight-1" size={4} />
                <div className="mt-4 text-xl font-semibold">Server is starting. Please wait!</div>
                <div className="mt-2 text-lg">
                  <span className="font-semibold">Status: </span>{status.data?.StartupMessage ?? 'Unknown'}
                </div>
              </div>
            )}
            {status.data?.State === 2 && (
              <React.Fragment>
                <form className="-mt-32" onSubmit={handleSignIn}>
                  <div className="flex flex-col">
                    <Input autoFocus id="username" value={username} label="Username" type="text" placeholder="Username" onChange={e => setUsername(e.target.value)} />
                    <Input id="password" value={password} label="Password" type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} className="mt-4" />
                  </div>
                  <Checkbox id="rememberUser" label="Remember Me" isChecked={rememberUser} onChange={e => setRememberUser(e.target.checked)} className="font-semibold mt-4" labelRight />
                  <Button className="bg-highlight-1 mt-4 py-2 w-full" type="submit" loading={isFetchingLogin} disabled={version.isFetching || username === ''}>Login</Button>
                </form>
              </React.Fragment>
            )}
            {status.data?.State === 3 && (
              <div className="flex flex-col justify-center items-center overflow-y-auto pb-2">
                <Icon path={mdiCloseCircle} className="text-highlight-3" size={4} />
                <div className="mt-4 text-xl font-semibold">Server startup failed!</div>
                Check the error message below
                <div className="mt-2 text-lg break-all overflow-y-auto font-open-sans font-semibold">{status.data?.StartupMessage ?? 'Unknown'}</div>
              </div>
            )}
            {status.data?.State === 4 && (
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
                <Button onClick={() => openFirstRunWizard()} className="bg-highlight-1 py-2 mt-4">Continue</Button>
              </div>
            )}
          </div>
          <div className="flex flex-col w-full">
            <Button className="flex bg-highlight-1 items-center justify-center py-2" onClick={() => window.open('https://discord.gg/vpeHDsg', '_blank')}>
              Get Help on <Icon path={siDiscord.path} size={0.75} className="mx-1" /> Discord
            </Button>
            <Button className="bg-highlight-1 py-2 mt-4" onClick={() => window.open('https://docs.shokoanime.com', '_blank')}>
              Documentation
            </Button>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default LoginPage;
