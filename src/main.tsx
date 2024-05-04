import React from 'react';
import { createRoutesFromChildren, matchRoutes, useLocation, useNavigationType } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { createRoot } from 'react-dom/client';

import App from './core/app';
import { isDebug, uiVersion } from './core/util';
import './css/main.css';

if (!isDebug()) {
  Sentry.init({
    dsn: 'https://f607489ccc764d73aeaed81ab2c97c04@o330862.ingest.sentry.io/1851857',
    environment: 'production',
    release: `shoko-webui@${uiVersion()}`,
    integrations: [
      Sentry.reactRouterV6BrowserTracingIntegration({
        useEffect: React.useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: false,
      }),
      Sentry.captureConsoleIntegration(),
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
  });
}

const container = document?.getElementById('app-root');

if (container !== null) {
  const root = createRoot(container);
  root.render(<App />);
}
