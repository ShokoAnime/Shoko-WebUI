import React, { useEffect, useMemo } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import * as Sentry from '@sentry/react';

import ErrorBoundary from '@/components/ErrorBoundary';
import { useVersionQuery } from '@/core/react-query/init/queries';
import { getServerSupport, isDebug } from '@/core/util';

const SentryErrorBoundaryWrapper = () => {
  const { pathname } = useLocation();
  const versionQuery = useVersionQuery();

  useEffect(() => {
    Sentry.setTag('server_release', versionQuery.data?.Server?.Version ?? 'Unknown');
  }, [versionQuery.data]);

  // Computed during render so unsupported servers never mount the real pages (which can crash on newer APIs)
  const redirectTo = useMemo(() => {
    if (isDebug() || !versionQuery.data || versionQuery.data.Server.ReleaseChannel === 'Debug') return null;

    const support = getServerSupport(versionQuery.data.Server.Version);

    // Login stays reachable on a too new server, so the user can authenticate and update the Web UI
    if (support === 'tooOld' || (support === 'tooNew' && pathname !== '/webui/login')) {
      return pathname === '/webui/unsupported' ? null : '/webui/unsupported';
    }
    return support === 'supported' && pathname === '/webui/unsupported' ? '/webui' : null;
  }, [pathname, versionQuery.data]);

  if (redirectTo) return <Navigate to={redirectTo} replace />;

  return (
    <Sentry.ErrorBoundary
      // eslint-disable-next-line @typescript-eslint/unbound-method -- Not our code, so we cannot fix it
      fallback={({ error, resetError }) => <ErrorBoundary error={error as Error} resetError={resetError} />}
    >
      <Outlet />
    </Sentry.ErrorBoundary>
  );
};

export default SentryErrorBoundaryWrapper;
