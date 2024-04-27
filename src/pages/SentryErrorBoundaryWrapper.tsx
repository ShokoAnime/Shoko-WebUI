import React from 'react';
import { Outlet } from 'react-router';
import * as Sentry from '@sentry/react';

import ErrorBoundary from '@/components/ErrorBoundary';

const SentryErrorBoundaryWrapper = () => (
  <Sentry.ErrorBoundary fallback={({ error }) => <ErrorBoundary error={error} />}>
    <Outlet />
  </Sentry.ErrorBoundary>
);

export default SentryErrorBoundaryWrapper;
