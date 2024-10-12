import React from 'react';
import { createRoutesFromChildren, matchRoutes, useLocation, useNavigationType } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { createRoot } from 'react-dom/client';

import App from './core/app';
import { isDebug, uiVersion } from './core/util';
import './css/main.css';

if (!isDebug()) {
  Sentry.init({
    dsn: 'https://3f1973bb1fd51855c342e5838a6d620f@o330862.ingest.us.sentry.io/1851857',
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
        networkDetailAllowUrls: ['/api/v3/Init/Version'],
        maskAllText: true,
        blockAllMedia: false,
      }),
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
