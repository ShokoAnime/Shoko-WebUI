import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import cx from 'classnames';
import { useNavigate } from 'react-router-dom';
import * as Sentry from '@sentry/browser';
import { get } from 'lodash';
import { Slide, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import { Icon } from '@mdi/react';
import { mdiCloseCircleOutline, mdiGithub, mdiHelpCircleOutline, mdiLoading } from '@mdi/js';
import { siDiscord } from 'simple-icons';

import { RootState } from '@/core/store';
import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import Checkbox from '@/components/Input/Checkbox';
import ShokoIcon from '@/components/ShokoIcon';

import { useGetInitStatusQuery, useGetInitVersionQuery } from '@/core/rtkQuery/splitV3Api/initApi';
import { useGetRandomMetadataQuery } from '@/core/rtkQuery/splitV3Api/imageApi';
import { usePostAuthMutation } from '@/core/rtkQuery/splitApi/authApi';
import { ImageTypeEnum } from '@/core/types/api/common';

function LoginPage() {
  const navigate = useNavigate();

  const apiSession = useSelector((state: RootState) => state.apiSession);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberUser, setRememberUser] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(500);
  const [loginImage, setLoginImage] = useState('');
  const [loginSeriesTitle, setLoginSeriesTitle] = useState('');

  const version = useGetInitVersionQuery();
  const [login, { isLoading: isFetchingLogin }] = usePostAuthMutation();
  const status = useGetInitStatusQuery(undefined, { pollingInterval });
  const imageMetadata = useGetRandomMetadataQuery({ imageType: ImageTypeEnum.Fanart });

  useEffect(() => {
    const { data } = imageMetadata;
    if (!data || !data?.Type) {
      setLoginImage('default');
      return;
    }
    const uri = `/api/v3/Image/${data.Source}/${data.Type}/${data.ID}`;
    setLoginImage(uri);
    setLoginSeriesTitle(data?.Series?.Name ?? '');
  }, [imageMetadata.data]);

  useEffect(() => {
    if (!status.data) setPollingInterval(500);
    else if (status.data?.State !== 1) setPollingInterval(0);

    if (status.data?.State === 2 && apiSession.rememberUser && apiSession.apikey !== '') {
      navigate('/', { replace: true });
    }
  }, [status.data]);

  useEffect(() => {
    if (!get(version, 'data.Server', false)) { return; }
    const versionHash = version?.data?.Server.ReleaseChannel !== 'Stable' ? version?.data?.Server.Commit : version.data.Server.Version;
    Sentry.setTag('server_version', versionHash);
  }, [version]);

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!username) return;

    login({
      user: username,
      pass: password,
      device: 'web-ui',
      rememberUser,
    }).unwrap().then(() => navigate('/'), error => console.error(error));
  };

  return (
    <React.Fragment>
      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        transition={Slide}
        className="mt-20 !w-[29.5rem]"
        closeButton={false}
        icon={false}
      />
      <div className={cx('flex h-screen w-screen login-image items-center justify-center relative', loginImage === 'default' && 'login-image-default')} style={loginImage !== '' && loginImage !== 'default' ? { backgroundImage: `url('${loginImage}')` } : {}}>
        <div className="absolute top-0 right-0 bg-background-alt/90 px-8 py-4 font-semibold border border-background-border">{imageMetadata.isError ? 'Spy X Family' : loginSeriesTitle}</div>

        <div className="flex flex-col items-center p-8 w-[31.25rem] bg-background-alt/90 border border-background-border rounded-md gap-y-8">
          <div className="flex flex-col gap-y-4 items-center">
            <ShokoIcon className="w-24" />
            <div className="font-semibold">
              Version: {version.isFetching || !version.data
              ? <Icon path={mdiLoading} spin size={1} className="ml-2 text-highlight-1" />
              : version.data.Server.ReleaseChannel !== 'Stable'
                ? `${version.data.Server.Version}-${version.data.Server.ReleaseChannel} (${version.data.Server.Commit?.slice(0, 7)})`
                : version.data.Server.Version}
            </div>
          </div>

          <div className="flex flex-col w-full gap-y-4">
            {!status.data?.State && (
              <div className="flex justify-center items-center">
                <Icon path={mdiLoading} spin className="text-highlight-1" size={4} />
              </div>
            )}
            {status.data?.State === 1 && (
              <div className="flex flex-col justify-center items-center gap-y-2">
                <Icon path={mdiLoading} spin className="text-highlight-1" size={4} />
                <div className="mt-2 text-xl font-semibold">Server is starting. Please wait!</div>
                <div className="text-lg">
                  <span className="font-semibold">Status: </span>{status.data?.StartupMessage ?? 'Unknown'}
                </div>
              </div>
            )}
            {status.data?.State === 2 && (
              <form onSubmit={handleSignIn} className="flex flex-col gap-y-8">
                <Input autoFocus id="username" value={username} label="Username" type="text" placeholder="Username" onChange={e => setUsername(e.target.value)} />
                <Input id="password" value={password} label="Password" type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
                <Checkbox id="rememberUser" label="Remember Me" isChecked={rememberUser} onChange={e => setRememberUser(e.target.checked)} className="font-semibold" labelRight />
                <Button className="bg-highlight-1 py-2 w-full font-semibold" type="submit" loading={isFetchingLogin} disabled={version.isFetching || username === ''}>Login</Button>
              </form>
            )}
            {status.data?.State === 3 && (
              <div className="flex flex-col justify-center items-center pb-2 gap-y-2 max-h-[20rem]">
                <Icon path={mdiCloseCircleOutline} className="text-highlight-3 shrink-0" size={4} />
                <div className="mt-2 text-xl font-semibold">Server startup failed!</div>
                Check the error message below
                <div className="text-lg break-all overflow-y-auto font-semibold">{status.data?.StartupMessage ?? 'Unknown'}</div>
              </div>
            )}
            {status.data?.State === 4 && (
              <div className="flex flex-col gap-y-12 py-8">
                <div className="flex flex-col gap-y-4 px-4">
                  <div>Welcome and thanks for installing Shoko!</div>
                  <div className="text-justify leading-6">
                    Before Shoko can start managing your anime collection for you, you&apos;ll need to go through our&nbsp;
                    <span className="text-highlight-2 font-bold">First Run Wizard </span>to set everything up.
                    Don&apos;t worry, its extremely easy, straightforward and should only take you a couple minutes.
                  </div>
                  <div>
                    Click <span className="text-highlight-2 font-semibold">Continue</span> below to proceed.
                  </div>
                </div>
                <Button onClick={() => navigate('/webui/firstrun')} className="bg-highlight-1 py-2 font-semibold">Continue</Button>
              </div>
            )}
          </div>

          <div className="flex font-semibold gap-x-8">
            <a href="https://discord.gg/vpeHDsg" target="_blank" rel="noopener noreferrer" className="flex items-center gap-x-2">
              <Icon path={siDiscord.path} size={1} />
              Discord
            </a>
            <a href="https://docs.shokoanime.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-x-2">
              <Icon path={mdiHelpCircleOutline} size={1} />
              Docs
            </a>
            <a href="https://github.com/ShokoAnime" target="_blank" rel="noopener noreferrer" className="flex items-center gap-x-2">
              <Icon path={mdiGithub} size={1} />
              GitHub
            </a>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default LoginPage;
