import * as Sentry from '@sentry/react';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './core/app';
import { uiVersion, isDebug } from './core/util';
import './css/main.css';

if (!isDebug()) {
  Sentry.init({
    dsn: 'https://f607489ccc764d73aeaed81ab2c97c04@o330862.ingest.sentry.io/1851857',
    environment: 'production',
    release: uiVersion(),
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: false,
      }),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

const container = document && document.getElementById('app-root');

if (container !== null) {
  const root = createRoot(container);
  root.render(<App />);
}
