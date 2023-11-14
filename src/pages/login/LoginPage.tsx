import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Slide, ToastContainer } from 'react-toastify';
import { mdiCloseCircleOutline, mdiGithub, mdiHelpCircleOutline, mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import * as Sentry from '@sentry/browser';
import cx from 'classnames';
import { get } from 'lodash';
import 'react-toastify/dist/ReactToastify.min.css';
import { siDiscord } from 'simple-icons';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import Input from '@/components/Input/Input';
import ShokoIcon from '@/components/ShokoIcon';
import { usePostAuthMutation } from '@/core/rtkQuery/splitApi/authApi';
import { useGetRandomMetadataQuery } from '@/core/rtkQuery/splitV3Api/imageApi';
import { useGetInitStatusQuery, useGetInitVersionQuery } from '@/core/rtkQuery/splitV3Api/initApi';
import { ImageTypeEnum } from '@/core/types/api/common';
import { useHashQuery } from '@/hooks/query';

import type { RootState } from '@/core/store';

function LoginPage() {
  const [{ returnTo = '/' }] = useHashQuery();
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
  }, [imageMetadata]);

  useEffect(() => {
    if (!status.data) setPollingInterval(500);
    else if (status.data?.State !== 1) setPollingInterval(0);

    if (status.data?.State === 2 && apiSession.rememberUser && apiSession.apikey !== '') {
      navigate(returnTo, { replace: true });
    }
  }, [status, apiSession, navigate, returnTo]);

  useEffect(() => {
    if (!get(version, 'data.Server', false)) return;
    const versionHash = version?.data?.Server.ReleaseChannel !== 'Stable'
      ? version?.data?.Server.Commit
      : version.data.Server.Version;
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
    }).unwrap().then(() => navigate(returnTo), error => console.error(error));
  };

  const parsedVersion = useMemo(() => {
    if (version.isFetching || !version.data) {
      return <Icon path={mdiLoading} spin size={1} className="ml-2 text-panel-text-primary" />;
    }

    if (version.data.Server.ReleaseChannel !== 'Stable') {
      return `${version.data.Server.Version}-${version.data.Server.ReleaseChannel} (${
        version.data.Server.Commit?.slice(0, 7)
      })`;
    }

    return version.data.Server.Version;
  }, [version]);

  return (
    <>
      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        transition={Slide}
        className="mt-20 !w-[29.5rem]"
        closeButton={false}
        icon={false}
      />
      <div
        className={cx(
          'flex h-screen w-screen login-image items-center justify-center relative',
          loginImage === 'default' && 'login-image-default',
        )}
        style={loginImage !== '' && loginImage !== 'default' ? { backgroundImage: `url('${loginImage}')` } : {}}
      >
        <div className="absolute right-0 top-0 border border-panel-border bg-panel-background-transparent px-8 py-4 font-semibold">
          {imageMetadata.isError ? 'One Piece' : loginSeriesTitle}
        </div>

        <div className="flex w-[30rem] flex-col items-center gap-y-8 rounded-lg border border-panel-border bg-panel-background-transparent p-8 drop-shadow-md">
          <div className="flex flex-col items-center gap-y-4">
            <ShokoIcon className="w-24" />
            <div className="font-semibold">
              Version:&nbsp;
              {parsedVersion}
            </div>
          </div>

          <div className="flex w-full flex-col gap-y-4">
            {!status.data?.State && (
              <div className="flex items-center justify-center">
                <Icon path={mdiLoading} spin className="text-panel-text-primary" size={4} />
              </div>
            )}
            {status.data?.State === 1 && (
              <div className="flex flex-col items-center justify-center gap-y-2">
                <Icon path={mdiLoading} spin className="text-panel-text-primary" size={4} />
                <div className="mt-2 text-xl font-semibold">Server is starting. Please wait!</div>
                <div className="text-lg">
                  <span className="font-semibold">Status:</span>
                  {status.data?.StartupMessage ?? 'Unknown'}
                </div>
              </div>
            )}
            {status.data?.State === 2 && (
              <form onSubmit={handleSignIn} className="flex flex-col gap-y-8">
                <Input
                  autoFocus
                  id="username"
                  value={username}
                  label="Username"
                  type="text"
                  placeholder="Username"
                  onChange={e => setUsername(e.target.value)}
                />
                <Input
                  id="password"
                  value={password}
                  label="Password"
                  type="password"
                  placeholder="Password"
                  onChange={e => setPassword(e.target.value)}
                />
                <Checkbox
                  id="rememberUser"
                  label="Remember Me"
                  isChecked={rememberUser}
                  onChange={e => setRememberUser(e.target.checked)}
                  className="font-semibold"
                  labelRight
                />
                <Button
                  buttonType="primary"
                  className="w-full py-2 font-semibold"
                  submit
                  loading={isFetchingLogin}
                  disabled={version.isFetching || username === ''}
                >
                  Login
                </Button>
              </form>
            )}
            {status.data?.State === 3 && (
              <div className="flex max-h-[20rem] flex-col items-center justify-center gap-y-2 pb-2">
                <Icon path={mdiCloseCircleOutline} className="shrink-0 text-panel-text-warning" size={4} />
                <div className="mt-2 text-xl font-semibold">Server startup failed!</div>
                Check the error message below
                <div className="overflow-y-auto break-all text-lg font-semibold">
                  {status.data?.StartupMessage ?? 'Unknown'}
                </div>
              </div>
            )}
            {status.data?.State === 4 && (
              <div className="flex flex-col gap-y-8">
                <div className="flex flex-col gap-y-4">
                  <div>Welcome and thanks for installing Shoko!</div>
                  <div className="text-justify">
                    Before Shoko can start managing your anime collection for you, you&apos;ll need to go through
                    our&nbsp;
                    <span className="font-bold text-panel-text-important">First Run Wizard</span>
                    &nbsp;to set everything up. Don&apos;t worry, its extremely easy, straightforward and should only
                    take you a couple minutes.
                  </div>
                  <div>
                    Click&nbsp;
                    <span className="font-semibold text-panel-text-important">Continue</span>
                    &nbsp;below to proceed.
                  </div>
                </div>
                <Button onClick={() => navigate('/webui/firstrun')} buttonType="primary" className="py-2 font-semibold">
                  Continue
                </Button>
              </div>
            )}
          </div>

          <div className="flex gap-x-8 font-semibold">
            <a
              href="https://discord.gg/vpeHDsg"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-x-2"
            >
              <Icon path={siDiscord.path} size={1} />
              Discord
            </a>
            <a
              href="https://docs.shokoanime.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-x-2"
            >
              <Icon path={mdiHelpCircleOutline} size={1} />
              Docs
            </a>
            <a
              href="https://github.com/ShokoAnime"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-x-2"
            >
              <Icon path={mdiGithub} size={1} />
              GitHub
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPage;
