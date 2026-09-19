import { useEffect, useState } from 'react';
import type { SubmitEvent } from 'react';
import { useSearchParams } from 'react-router';
import { mdiGithub, mdiHelpCircleOutline, mdiLoading, mdiOpenInNew } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { siDiscord } from 'simple-icons';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import Input from '@/components/Input/Input';
import ShokoIcon from '@/components/ShokoIcon';
import ToastContainer from '@/components/ToastContainer';
import { useLoginMutation } from '@/core/react-query/auth/mutations';
import { useRandomImageMetadataQuery } from '@/core/react-query/image/queries';
import { useServerStatusQuery, useVersionQuery } from '@/core/react-query/init/queries';
import { useSelector } from '@/core/store';
import toast from '@/core/toast';
import useNavigateVoid from '@/hooks/useNavigateVoid';

const LoginPage = () => {
  const navigate = useNavigateVoid();
  const [searchParams, setSearchParams] = useSearchParams();

  const apiSession = useSelector(state => state.apiSession);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberUser, setRememberUser] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(500);

  const versionQuery = useVersionQuery();
  const { isPending: isLoginPending, mutate: login } = useLoginMutation();
  const serverStatusQuery = useServerStatusQuery(pollingInterval);
  const imageMetadataQuery = useRandomImageMetadataQuery('Backdrop');

  let loginImage = { imageUrl: '', seriesName: '', seriesId: 0 };
  if (!imageMetadataQuery.isPending && (!imageMetadataQuery.isSuccess || !imageMetadataQuery.data?.UID)) {
    loginImage = { imageUrl: 'default', seriesName: 'One Piece', seriesId: 0 };
  } else if (imageMetadataQuery.isSuccess && imageMetadataQuery.data.UID) {
    loginImage = {
      imageUrl: `/api/v3/Image/${imageMetadataQuery.data.UID}`,
      seriesName: imageMetadataQuery.data.Series?.Name ?? '',
      seriesId: imageMetadataQuery.data.Series?.ID ?? 0,
    };
  }

  const setRedirect = () => {
    if (loginImage.seriesId === 0) return;
    setSearchParams(`redirectTo=/webui/collection/series/${loginImage.seriesId}`, { replace: true });
  };

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- poll server status until it responds, then stop
    if (!serverStatusQuery.data) setPollingInterval(500);
    else setPollingInterval(0);

    // Only Started and Waiting are handled here; anything else belongs on the status page.
    if (
      serverStatusQuery.isError
      || (serverStatusQuery.data && !['Started', 'Waiting'].includes(serverStatusQuery.data.State))
    ) {
      navigate('/webui/status', { replace: true });
      return;
    }

    if (serverStatusQuery.data?.State === 'Started' && apiSession.apikey !== '') {
      navigate(searchParams.get('redirectTo') ?? '/webui', { replace: true });
    }
  }, [serverStatusQuery.data, serverStatusQuery.isError, apiSession, navigate, searchParams]);

  const handleSignIn = (event: SubmitEvent) => {
    event.preventDefault();
    if (!username) return;

    login(
      {
        user: username,
        pass: password,
        device: 'web-ui',
        rememberUser,
      },
      {
        onSuccess: () => {
          navigate(searchParams.get('redirectTo') ?? '/webui');
        },
        onError: () => toast.error('Invalid Username or Password. Try again.'),
      },
    );
  };

  const parsedVersion = (() => {
    if (versionQuery.isFetching || !versionQuery.data) {
      return <Icon path={mdiLoading} spin size={1} className="ml-2 text-panel-text-primary" />;
    }

    const { Commit, ReleaseChannel, Version } = versionQuery.data.Server;
    return ReleaseChannel !== 'Stable' ? `${Version} (${Commit?.slice(0, 7)})` : Version;
  })();

  return (
    <>
      <title>Login | Shoko</title>
      <ToastContainer toastPosition="bottom-right" />
      <div className="relative flex h-screen w-screen flex-col items-center justify-center gap-y-2">
        <div className="flex flex-col items-center rounded-lg border border-panel-border bg-panel-background-transparent drop-shadow-md">
          <div className="flex w-200 flex-row items-center gap-x-6 p-6">
            <div className="flex w-80 flex-col items-center gap-y-6 py-6">
              <ShokoIcon className="size-32" />
              <div className="flex flex-col gap-y-1 text-center font-semibold">
                <span>Version</span>
                <span>{parsedVersion}</span>
              </div>
            </div>
            <div className="flex w-full flex-col gap-y-6">
              {!serverStatusQuery.data?.State && (
                <div className="flex items-center justify-center">
                  <Icon path={mdiLoading} spin className="text-panel-text-primary" size={4} />
                </div>
              )}
              {serverStatusQuery.data?.State === 'Started' && (
                <form onSubmit={handleSignIn} className="flex flex-col gap-y-6">
                  <Input
                    autoFocus
                    id="username"
                    value={username}
                    label="Username"
                    type="text"
                    placeholder="Username"
                    onChange={event =>
                      setUsername(event.target.value)}
                  />
                  <Input
                    id="password"
                    value={password}
                    label="Password"
                    type="password"
                    placeholder="Password"
                    onChange={event =>
                      setPassword(event.target.value)}
                  />
                  <Checkbox
                    id="rememberUser"
                    label="Remember Me"
                    isChecked={rememberUser}
                    onChange={event => setRememberUser(event.target.checked)}
                    className="font-semibold"
                    labelRight
                  />
                  <Button
                    buttonType="primary"
                    buttonSize="normal"
                    className="w-full"
                    submit
                    loading={isLoginPending}
                    disabled={versionQuery.isFetching || username === ''}
                  >
                    Login
                  </Button>
                </form>
              )}
              {serverStatusQuery.data?.State === 'Waiting' && (
                <div className="flex flex-col gap-y-6">
                  <div className="flex flex-col gap-y-4">
                    <div>Welcome, and thank you for installing Shoko!</div>
                    <div>
                      Before Shoko can begin organizing your anime collection, you&apos;ll need to go through the
                      <span className="font-semibold text-panel-text-important">&nbsp;First Time Setup&nbsp;</span>
                      process. This step lets you tailor Shoko according to your preferences, and is designed to be
                      quick and straightforward, requiring only a few minutes of your time.
                    </div>
                    <div>
                      Click&nbsp;
                      <span className="font-semibold text-panel-text-important">Continue</span>
                      &nbsp;below to proceed.
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate('/webui/firstrun')}
                    buttonType="primary"
                    className="py-2 font-semibold"
                  >
                    Continue
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="flex w-full flex-row justify-between gap-x-6 border-t-2 border-panel-border px-6 py-4 font-semibold">
            <div className="flex gap-x-2">
              <div
                className={cx(
                  'flex max-w-92 items-center gap-x-2 font-semibold',
                  loginImage.seriesId && 'cursor-pointer text-panel-text-primary',
                )}
                onClick={setRedirect}
              >
                {/* oxlint-disable-next-line no-nested-ternary -- nested ternary picks the fallback title for the login art */}
                {imageMetadataQuery.isError
                  ? 'One Piece'
                  : imageMetadataQuery.data?.Series === undefined
                  ? 'Series Not Found'
                  : (
                    <>
                      <span className="truncate" title={loginImage.seriesName}>{loginImage.seriesName}</span>
                      <Icon className="shrink-0 text-panel-text-primary" path={mdiOpenInNew} size={1} />
                    </>
                  )}
              </div>
            </div>
            <div className="flex flex-row gap-x-6">
              <a
                href="https://discord.gg/vpeHDsg"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-x-2 transition-colors hover:text-header-icon-primary"
              >
                <Icon path={siDiscord.path} size={1} />
                Discord
              </a>
              <a
                href="https://docs.shokoanime.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-x-2 transition-colors hover:text-header-icon-primary"
              >
                <Icon path={mdiHelpCircleOutline} size={1} />
                Docs
              </a>
              <a
                href="https://github.com/ShokoAnime"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-x-2 transition-colors hover:text-header-icon-primary"
              >
                <Icon path={mdiGithub} size={1} />
                GitHub
              </a>
            </div>
          </div>
        </div>
        <div
          className={cx(
            'fixed top-0 left-0 -z-10 size-full opacity-20',
            loginImage.imageUrl === 'default' && 'login-image-default',
          )}
          style={loginImage.imageUrl !== '' && loginImage.imageUrl !== 'default'
            ? { background: `center / cover no-repeat url('${loginImage.imageUrl}')` }
            : {}}
        />
      </div>
    </>
  );
};

export default LoginPage;
