import { useEffect, useLayoutEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { Outlet, useLocation } from 'react-router';
import * as Sentry from '@sentry/react';
import semver from 'semver';

import ErrorBoundary from '@/components/ErrorBoundary';
import { useVersionQuery } from '@/core/react-query/init/queries';
import { getMinimumServerVersion, isDebug } from '@/core/util';
import useNavigateVoid from '@/hooks/useNavigateVoid';

const RECOVERY_THROTTLE_MS = 5000;

// Works around a documented React limitation, not specific to any React version: React doesn't support
// something outside its control (a browser extension, a third-party script) mutating a DOM node it manages —
// see https://react.dev/learn/manipulating-the-dom-with-refs ("Avoid changing DOM nodes managed by React") and
// https://github.com/facebook/react/issues/17256 (still open; a Chrome extension causes this exact error) — a
// later commit's removeChild/insertBefore then targets a node that's already gone. It isn't caused by our code —
// seen on unrelated screens with frequent re-renders, e.g. /webui/firstrun/start-server (status polling) and
// /webui/collection/filter/live (debounced search) — so we recover instead of showing the crash page.
const isRecoverableDomRaceError = (error: unknown): error is Error =>
  error instanceof Error
  && error.name === 'NotFoundError'
  && /Failed to execute '(removeChild|insertBefore)' on 'Node'/.test(error.message);

type RaceRecoveryFallbackProps = {
  error?: Error;
  lastAutoRecoveredAtRef: RefObject<number>;
  resetError: () => void;
};

const RaceRecoveryFallback = ({ error, lastAutoRecoveredAtRef, resetError }: RaceRecoveryFallbackProps) => {
  const recoveryRef = lastAutoRecoveredAtRef;
  const now = Date.now();
  const canAutoRecover = isRecoverableDomRaceError(error)
    && (now - recoveryRef.current > RECOVERY_THROTTLE_MS);

  useLayoutEffect(() => {
    if (!canAutoRecover) return;
    recoveryRef.current = now;
    resetError();
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- only re-run when the recoverability verdict changes
  }, [canAutoRecover, resetError]);

  if (canAutoRecover) return null;

  return <ErrorBoundary error={error} resetError={resetError} />;
};

const SentryErrorBoundaryWrapper = () => {
  const { pathname } = useLocation();
  const navigate = useNavigateVoid();
  const versionQuery = useVersionQuery();
  const lastAutoRecoveredAtRef = useRef(0);

  useEffect(() => {
    Sentry.setTag('server_release', versionQuery.data?.Server?.Version ?? 'Unknown');
  }, [versionQuery.data]);

  useEffect(() => {
    if (isDebug()) return;

    if (!versionQuery.data || versionQuery.data.Server.ReleaseChannel === 'Debug') return;

    const isServerSupported = semver.gte(versionQuery.data.Server.Version, getMinimumServerVersion());

    if (!isServerSupported) {
      navigate('/webui/unsupported');
    } else if (pathname === '/webui/unsupported') {
      navigate('/webui');
    }
  }, [navigate, pathname, versionQuery.data]);

  return (
    <Sentry.ErrorBoundary
      // oxlint-disable-next-line typescript/unbound-method -- Not our code, so we cannot fix it
      fallback={({ error, resetError }) => (
        <RaceRecoveryFallback
          error={error as Error}
          lastAutoRecoveredAtRef={lastAutoRecoveredAtRef}
          resetError={resetError}
        />
      )}
    >
      <Outlet />
    </Sentry.ErrorBoundary>
  );
};

export default SentryErrorBoundaryWrapper;
