import React, { useEffect } from 'react';
import { Outlet } from 'react-router';
import { useNavigate } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import semver from 'semver';

import ErrorBoundary from '@/components/ErrorBoundary';
import { useVersionQuery } from '@/core/react-query/init/queries';
import { getParsedSupportedServerVersion, isDebug, parseServerVersion } from '@/core/util';

const SentryErrorBoundaryWrapper = () => {
  const navigate = useNavigate();
  const versionQuery = useVersionQuery();

  useEffect(() => {
    Sentry.setTag('server_release', versionQuery.data?.Server?.Version ?? 'Unknown');
  }, [versionQuery.data]);

  useEffect(() => {
    if (isDebug()) return;

    if (!versionQuery.data || versionQuery.data.Server.ReleaseChannel === 'Debug') return;

    const serverData = versionQuery.data?.Server;

    let isServerSupported = true;

    const semverVersion = parseServerVersion(serverData.Version);
    const minimumVersion = getParsedSupportedServerVersion();
    if (semverVersion && semver.lt(semverVersion, minimumVersion)) isServerSupported = false;

    if (!isServerSupported) {
      navigate('/webui/unsupported');
    }
  }, [navigate, versionQuery.data]);

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
