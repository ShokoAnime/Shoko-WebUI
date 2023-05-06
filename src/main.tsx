import { Integrations } from '@sentry/tracing';
import * as Sentry from '@sentry/react';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import 'isomorphic-fetch';
import 'es6-promise/auto';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './core/app';
import { uiVersion } from './core/util';

Sentry.init({
  dsn: 'https://f607489ccc764d73aeaed81ab2c97c04@o330862.ingest.sentry.io/1851857',
  environment: 'production',
  release: uiVersion(),
  integrations: [
    new Integrations.BrowserTracing(),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: false,
    }),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

const container = document && document.getElementById('app-root');

if (container !== null) {
  const root = createRoot(container);
  root.render(<App />);
}
