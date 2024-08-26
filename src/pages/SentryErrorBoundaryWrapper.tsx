import React, { useEffect } from 'react';
import { Outlet } from 'react-router';
import * as Sentry from '@sentry/react';
import { get } from 'lodash';

import ErrorBoundary from '@/components/ErrorBoundary';
import { useVersionQuery } from '@/core/react-query/init/queries';

const SentryErrorBoundaryWrapper = () => {
  const versionQuery = useVersionQuery();

  useEffect(() => {
    if (!get(versionQuery.data, 'Server', false)) return;
    const versionHash = versionQuery?.data?.Server.ReleaseChannel !== 'Stable'
      ? versionQuery?.data?.Server.Commit
      : versionQuery.data.Server.Version;
    Sentry.setTag('server_version', versionHash);
  }, [versionQuery.data]);

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
