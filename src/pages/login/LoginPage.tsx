import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router';
import { Slide, ToastContainer } from 'react-toastify';
import {
  mdiAlertCircleOutline,
  mdiCloseCircleOutline,
  mdiGithub,
  mdiHelpCircleOutline,
  mdiLoading,
  mdiOpenInNew,
} from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { siDiscord } from 'simple-icons';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import Input from '@/components/Input/Input';
import ShokoIcon from '@/components/ShokoIcon';
import { useLoginMutation } from '@/core/react-query/auth/mutations';
import { useRandomImageMetadataQuery } from '@/core/react-query/image/queries';
import { useServerStatusQuery, useVersionQuery } from '@/core/react-query/init/queries';
import { ImageTypeEnum } from '@/core/types/api/common';
import useNavigateVoid from '@/hooks/useNavigateVoid';

import type { RootState } from '@/core/store';

const LoginPage = () => {
  const { t } = useTranslation('login');
  const navigate = useNavigateVoid();
  const [searchParams, setSearchParams] = useSearchParams();

  const apiSession = useSelector((state: RootState) => state.apiSession);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [rememberUser, setRememberUser] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(500);
  const [{ imageUrl, seriesId, seriesName }, setLoginImage] = useState(() => ({
    imageUrl: '',
    seriesName: '',
    seriesId: 0,
  }));

  const versionQuery = useVersionQuery();
  const { isPending: isLoginPending, mutate: login } = useLoginMutation();
  const serverStatusQuery = useServerStatusQuery(pollingInterval);
  const imageMetadataQuery = useRandomImageMetadataQuery(ImageTypeEnum.Backdrop);

  const setRedirect = () => {
    if (seriesId === 0) return;
    setSearchParams(`redirectTo=/webui/collection/series/${seriesId}`, { replace: true });
  };

  useEffect(() => {
    if (imageMetadataQuery.isPending) return;
    if (!imageMetadataQuery.isSuccess || !imageMetadataQuery.data.Type) {
      setLoginImage({ imageUrl: 'default', seriesName: 'One Piece', seriesId: 0 });
      return;
    }
    const { ID, Series, Source, Type } = imageMetadataQuery.data;
    setLoginImage({
      imageUrl: `/api/v3/Image/${Source}/${Type}/${ID}`,
      seriesName: Series?.Name ?? '',
      seriesId: Series?.ID ?? 0,
    });
  }, [imageMetadataQuery.isSuccess, imageMetadataQuery.isPending, imageMetadataQuery.data]);

  useEffect(() => {
    if (!serverStatusQuery.data) setPollingInterval(500);
    else if (serverStatusQuery.data?.State !== 'Starting') setPollingInterval(0);

    if (serverStatusQuery.data?.State === 'Started' && apiSession.apikey !== '') {
      navigate(searchParams.get('redirectTo') ?? '/webui', { replace: true });
    }
  }, [serverStatusQuery.data, apiSession, navigate, searchParams]);

  const handleSignIn = (event: React.FormEvent) => {
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
          setLoginError(false);
          navigate(searchParams.get('redirectTo') ?? '/webui');
        },
        onError: () => setLoginError(true),
      },
    );
  };

  const parsedVersion = useMemo(() => {
    if (versionQuery.isFetching || !versionQuery.data) {
      return <Icon path={mdiLoading} spin size={1} className="ml-2 text-panel-text-primary" />;
    }

    if (versionQuery.data.Server.ReleaseChannel !== 'Stable') {
      return `${versionQuery.data.Server.Version}-${versionQuery.data.Server.ReleaseChannel} (${
        versionQuery.data.Server.Commit?.slice(0, 7)
      })`;
    }

    return versionQuery.data.Server.Version;
  }, [versionQuery.data, versionQuery.isFetching]);

  return (
    <>
      <title>Login | Shoko</title>
      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        transition={Slide}
        className="mt-20 !w-[29.5rem]"
        closeButton={false}
        icon={false}
      />
      <div className="relative flex h-screen w-screen flex-col items-center justify-center gap-y-2">
        {loginError && (
          <div className="flex w-full max-w-[50rem] justify-center gap-x-2 rounded-lg border border-panel-border bg-panel-background-transparent p-4 drop-shadow-md">
            <Icon className="text-panel-text-danger" path={mdiAlertCircleOutline} size={1} />
            <div className="font-semibold text-panel-text-danger">
              {t('error.invalidCredentials')}
            </div>
          </div>
        )}
        <div className="flex flex-col items-center rounded-lg border border-panel-border bg-panel-background-transparent drop-shadow-md">
          <div className="flex w-[50rem] flex-row items-center gap-x-6 p-6">
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
              {serverStatusQuery.data?.State === 'Starting' && (
                <div className="flex flex-col items-center justify-center gap-y-2">
                  <Icon path={mdiLoading} spin className="text-panel-text-primary" size={4} />
                  <div className="mt-2 text-xl font-semibold">{t('server.starting')}</div>
                  <div className="text-lg">
                    <span className="font-semibold">
                      {t('server.statusLabel')}
                    </span>
                    {serverStatusQuery.data?.StartupMessage ?? t('common.unknown')}
                  </div>
                </div>
              )}
              {serverStatusQuery.data?.State === 'Started' && (
                <form onSubmit={handleSignIn} className="flex flex-col gap-y-6">
                  <Input
                    autoFocus
                    id="username"
                    value={username}
                    label={t('form.username')}
                    type="text"
                    placeholder={t('form.username')}
                    onChange={event =>
                      setUsername(event.target.value)}
                  />
                  <Input
                    id="password"
                    value={password}
                    label={t('form.password')}
                    type="password"
                    placeholder={t('form.password')}
                    onChange={event =>
                      setPassword(event.target.value)}
                  />
                  <Checkbox
                    id="rememberUser"
                    label={t('form.rememberMe')}
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
                    {t('form.login')}
                  </Button>
                </form>
              )}
              {serverStatusQuery.data?.State === 'Failed' && (
                <div className="flex max-h-80 flex-col items-center justify-center gap-y-2 pb-2">
                  <Icon path={mdiCloseCircleOutline} className="shrink-0 text-panel-text-warning" size={4} />
                  <div className="mt-2 text-xl font-semibold">
                    {t('server.failed')}
                  </div>
                  Check the error message below
                  <div className="overflow-y-auto break-all text-lg font-semibold">
                    {serverStatusQuery.data?.StartupMessage ?? t('common.unknown')}
                  </div>
                </div>
              )}
              {serverStatusQuery.data?.State === 'Waiting' && (
                <div className="flex flex-col gap-y-6">
                  <div className="flex flex-col gap-y-4">
                    <div>{t('firstrun.welcome')}</div>
                    <div>
                      {t('firstrun.description.before')}
                      <span className="font-semibold text-panel-text-important">
                        &nbsp;
                        {t('firstrun.description.highlight')}
                        &nbsp;
                      </span>
                      {t('firstrun.description.after')}
                    </div>
                    <div>
                      {t('firstrun.continueHint.before')}
                      <span className="font-semibold text-panel-text-important">
                        {t('common.continue')}
                      </span>
                      {t('firstrun.continueHint.after')}
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate('/webui/firstrun')}
                    buttonType="primary"
                    className="py-2 font-semibold"
                  >
                    {t('common.continue')}
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="flex w-full flex-row justify-between gap-x-6 border-t-2 border-panel-border px-6 py-4 font-semibold">
            <div className="flex gap-x-2">
              <div
                className={cx(
                  'flex gap-x-2 items-center font-semibold max-w-[23rem]',
                  seriesId && 'cursor-pointer text-panel-text-primary',
                )}
                onClick={setRedirect}
              >
                {/* eslint-disable-next-line no-nested-ternary */}
                {imageMetadataQuery.isError
                  ? t('series.default')
                  : imageMetadataQuery.data?.Series === undefined
                  ? t('series.notFound')
                  : (
                    <>
                      <span className="truncate" title={seriesName}>{seriesName}</span>
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
            'fixed left-0 top-0 -z-10 h-full w-full opacity-20',
            imageUrl === 'default' && 'login-image-default',
          )}
          style={imageUrl !== '' && imageUrl !== 'default'
            ? { background: `center / cover no-repeat url('${imageUrl}')` }
            : {}}
        />
      </div>
    </>
  );
};

export default LoginPage;
