import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { mdiAlertCircleOutline, mdiCogPlayOutline, mdiLoading, mdiPower, mdiRestart, mdiServerOff } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useQueryClient } from '@tanstack/react-query';

import ShokoMascot from '@/../images/shoko_mascot.png';
import Button from '@/components/Input/Button';
import { useServerRestartMutation } from '@/core/react-query/init/mutations';
import { useServerStatusQuery } from '@/core/react-query/init/queries';
import { clearAction, setAction } from '@/core/slices/serverLifecycle';
import { useDispatch, useSelector } from '@/core/store';
import useNavigateVoid from '@/hooks/useNavigateVoid';

import type { ServerLifecycleAction } from '@/core/slices/serverLifecycle';
import type { ServerStatusType } from '@/core/types/api/init';

type Variant = 'failed' | 'loading' | 'offline' | 'restarting' | 'shutdown' | 'shutting-down' | 'starting';

type VariantDetail = {
  activity?: string;
  body?: string;
  bodyTimeout?: string;
  button?: string;
  headline: string;
  statusFallback?: string;
  title: string;
  whisper?: string;
};

const RESTART_TIMEOUT_MS = 180_000;
const OFFLINE_BACKOFF_MS = 60_000;
const STATUS_FRESH_MS = 5_000;
const POLL_INTERVAL_FAST_MS = 2_000;
const RETRY_INTERVAL_FAST_MS = 5_000;
const RETRY_INTERVAL_SLOW_MS = 15_000;

const variantDetailMap: Record<Variant, VariantDetail> = {
  loading: {
    headline: 'Checking server status…',
    title: 'Checking… | Shoko',
  },
  offline: {
    activity: 'Retrying automatically…',
    body: 'The server stopped responding. This usually means it crashed or the connection to it dropped.',
    bodyTimeout:
      'The server didn\'t come back within 3 minutes of restarting. It may still be starting, or something went wrong.',
    button: 'Retry Now',
    headline: 'Shoko appears to be offline',
    title: 'Offline | Shoko',
    whisper: 'You can also retry manually — automatic checks keep running either way.',
  },
  restarting: {
    headline: 'Shoko is restarting…',
    statusFallback: 'Waiting for the server to come back…',
    title: 'Restarting… | Shoko',
    whisper: 'This can take a minute or two.',
  },
  'shutting-down': {
    activity: 'Waiting for the server to stop…',
    headline: 'Shoko is shutting down…',
    title: 'Shutting Down… | Shoko',
  },
  shutdown: {
    body:
      'The server process has stopped. To use Shoko again, start Shoko Server on the host machine, then retry the connection.',
    button: 'Retry Connection',
    headline: 'Shoko has shut down',
    title: 'Shut Down | Shoko',
  },
  starting: {
    activity: 'This usually takes less than a minute.',
    headline: 'Shoko is starting up…',
    statusFallback: 'Preparing…',
    title: 'Starting… | Shoko',
  },
  failed: {
    body: 'The server process is still running, so you can restart it from here.',
    button: 'Restart Server',
    headline: 'Shoko failed to start',
    title: 'Failed to Start | Shoko',
  },
};

type VariantIcon = {
  className: string;
  path: string;
  spin: boolean | number;
};

const variantIconMap: Record<Variant, VariantIcon> = {
  loading: { className: 'text-panel-text-primary', path: mdiLoading, spin: true },
  offline: { className: 'text-panel-text-warning', path: mdiServerOff, spin: false },
  restarting: { className: 'text-panel-text-primary', path: mdiRestart, spin: -2 },
  shutdown: { className: 'text-panel-text', path: mdiPower, spin: false },
  'shutting-down': { className: 'text-panel-text-danger', path: mdiPower, spin: false },
  starting: { className: 'text-panel-text-primary', path: mdiCogPlayOutline, spin: false },
  failed: { className: 'text-panel-text-danger', path: mdiAlertCircleOutline, spin: false },
};

const deriveVariant = (
  action: ServerLifecycleAction,
  initiatedAt: number | null,
  isError: boolean,
  serverState: ServerStatusType['State'] | undefined,
  consecutiveErrors: number,
): Variant => {
  if (action === 'restarting') {
    const timedOut = initiatedAt !== null && Date.now() - initiatedAt > RESTART_TIMEOUT_MS;
    return timedOut ? 'offline' : 'restarting';
  }
  if (action === 'shutting-down') return consecutiveErrors >= 2 ? 'shutdown' : 'shutting-down';
  if (isError) return 'offline';
  if (serverState === 'Starting') return 'starting';
  if (serverState === 'Failed') return 'failed';
  return 'loading';
};

const StatusPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigateVoid();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const apikey = useSelector(state => state.apiSession.apikey);
  const lifecycle = useSelector(state => state.serverLifecycle);

  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  const [offlineStartedAt, setOfflineStartedAt] = useState<number | null>(null);
  const [refetchInterval, setRefetchInterval] = useState(0);
  const [isManualRetryPending, setIsManualRetryPending] = useState(false);

  const serverStatusQuery = useServerStatusQuery(refetchInterval);
  const { isPending: isRestartPending, mutateAsync: restartServer } = useServerRestartMutation();

  const lastSeenStartedAtRef = useRef(serverStatusQuery.dataUpdatedAt);
  const sawDisruptionRef = useRef(false);

  const serverState = serverStatusQuery.data?.State;
  const startupMessage = serverStatusQuery.data?.StartupMessage;
  const isDatabaseBlocked = serverStatusQuery.data?.DatabaseBlocked?.Blocked ?? false;
  const blockedReason = serverStatusQuery.data?.DatabaseBlocked?.Reason;
  const canRestart = serverStatusQuery.data?.CanRestart ?? false;
  const hasFailedMessage = !!startupMessage || isDatabaseBlocked;

  const variant = deriveVariant(
    lifecycle.action,
    lifecycle.initiatedAt,
    serverStatusQuery.isError,
    serverState,
    consecutiveErrors,
  );

  const detail = variantDetailMap[variant];

  const bodyText = variant === 'offline' && lifecycle.action === 'restarting'
    ? detail.bodyTimeout
    : detail.body;

  const icon = variantIconMap[variant];

  const nextRefetchInterval = (() => {
    switch (variant) {
      case 'restarting':
      case 'shutting-down':
      case 'starting':
        return POLL_INTERVAL_FAST_MS;
      case 'failed':
        return RETRY_INTERVAL_SLOW_MS;
      case 'offline':
        if (offlineStartedAt === null) return RETRY_INTERVAL_FAST_MS;
        return Date.now() - offlineStartedAt < OFFLINE_BACKOFF_MS ? RETRY_INTERVAL_FAST_MS : RETRY_INTERVAL_SLOW_MS;
      default:
        return 0;
    }
  })();

  // Counts completed poll cycles that settled on error; a successful cycle resets it.
  // Used for the shutdown Phase A -> B transition (2 *consecutive* failures).
  useEffect(() => {
    if (serverStatusQuery.fetchStatus !== 'idle') return;
    if (serverStatusQuery.isError) {
      setConsecutiveErrors(prev => prev + 1);
    } else {
      setConsecutiveErrors(0);
    }
  }, [serverStatusQuery.fetchStatus, serverStatusQuery.isError]);

  useEffect(() => {
    if (variant === 'offline') {
      if (offlineStartedAt === null) setOfflineStartedAt(Date.now());
    } else if (offlineStartedAt !== null) {
      setOfflineStartedAt(null);
    }
  }, [variant, offlineStartedAt]);

  useEffect(() => {
    setRefetchInterval(nextRefetchInterval);
  }, [nextRefetchInterval]);

  // When the server is back to Started, redirect immediately — no recovery UI.
  // Fires on a *transition* into Started after a disruption, so stale pre-restart 'Started'
  // cache can't fake a recovery. Also covers a fresh direct landing on an idle Started server.
  useEffect(() => {
    if (serverStatusQuery.isError) {
      sawDisruptionRef.current = true;
      return;
    }
    const currentState = serverStatusQuery.data?.State;
    if (currentState !== 'Started') {
      if (currentState) sawDisruptionRef.current = true;
      return;
    }
    const { dataUpdatedAt } = serverStatusQuery;
    const justRecovered = sawDisruptionRef.current && dataUpdatedAt > lastSeenStartedAtRef.current;
    const freshIdle = lifecycle.action === 'idle' && Date.now() - dataUpdatedAt < STATUS_FRESH_MS;
    lastSeenStartedAtRef.current = dataUpdatedAt;
    if (justRecovered || freshIdle) {
      dispatch(clearAction());
      queryClient.removeQueries();
      navigate(apikey !== '' ? searchParams.get('redirectTo') ?? '/webui' : '/webui/login', { replace: true });
    }
  }, [
    apikey,
    dispatch,
    lifecycle.action,
    navigate,
    queryClient,
    searchParams,
    serverStatusQuery.data?.State,
    serverStatusQuery.dataUpdatedAt,
    serverStatusQuery.isError,
  ]);

  useEffect(() => {
    if (serverState === 'Waiting' && lifecycle.action === 'idle') {
      navigate('/webui/login', { replace: true });
    }
  }, [lifecycle.action, navigate, serverState]);

  const handleRestartServer = () => {
    dispatch(setAction('restarting'));
    restartServer(undefined).catch((error) => {
      console.error(error);
      dispatch(clearAction());
    });
  };

  const retry = (resetBackoff: boolean) => {
    if (resetBackoff) setOfflineStartedAt(Date.now());
    setIsManualRetryPending(true);
    serverStatusQuery.refetch()
      .catch(console.error)
      .finally(() => setIsManualRetryPending(false));
  };

  const showButton = !!detail.button && (variant !== 'failed' || canRestart);
  const buttonPending = variant === 'failed' ? isRestartPending : isManualRetryPending;

  const handleButtonClick = () => {
    if (variant === 'failed') {
      handleRestartServer();
    } else {
      retry(variant === 'offline');
    }
  };

  return (
    <>
      <title>{detail.title}</title>
      <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden p-6">
        <div className="flex h-full max-w-230 flex-col items-center justify-center gap-y-4 overflow-y-auto text-center md:gap-y-6">
          <div className="flex flex-col items-center gap-y-4 md:gap-y-6">
            <Icon
              path={icon.path}
              size={4}
              spin={icon.spin}
              className={icon.className}
            />

            <div className="text-4xl text-panel-text md:text-5xl">{detail.headline}</div>

            {!!detail.statusFallback && (
              <div className="text-lg">
                {startupMessage ?? detail.statusFallback}
              </div>
            )}

            {variant === 'failed'
              ? (
                <div className="flex flex-col gap-y-4">
                  {canRestart && <div className="text-lg">{detail.body}</div>}
                  <div>
                    Still stuck? Hop on our&nbsp;
                    <a
                      href="https://discord.gg/vpeHDsg"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-panel-text-primary"
                    >
                      Discord
                    </a>
                    &nbsp;and share the message above.
                  </div>
                </div>
              )
              : bodyText && <div className="text-lg">{bodyText}</div>}

            {detail.activity && (
              <div className="flex items-center gap-x-2 text-panel-text-primary">
                <Icon path={mdiLoading} size={1} spin />
                <span className="text-lg">{detail.activity}</span>
              </div>
            )}

            {variant === 'failed' && hasFailedMessage && (
              <pre className="max-h-100 max-w-full overflow-y-auto rounded-lg border border-panel-border bg-panel-input p-4 whitespace-pre-wrap md:p-6">
                {isDatabaseBlocked && (
                  <>
                    Database blocked: {blockedReason ?? 'Unknown reason'}
                    <br />
                    <br />
                  </>
                )}
                {startupMessage}
              </pre>
            )}

            {showButton && (
              <Button
                buttonType="primary"
                buttonSize="normal"
                loading={buttonPending}
                onClick={handleButtonClick}
              >
                {detail.button}
              </Button>
            )}

            {detail.whisper && <div className="text-sm opacity-65">{detail.whisper}</div>}
          </div>
        </div>

        <img
          src={ShokoMascot}
          alt="mascot"
          className="absolute -right-36 -bottom-40 z-10 opacity-30"
        />
      </div>
    </>
  );
};

export default StatusPage;
