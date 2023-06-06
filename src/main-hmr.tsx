import * as Sentry from '@sentry/react';

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './core/app-hmr';
import { uiVersion } from './core/util';

Sentry.init({
  dsn: 'https://f607489ccc764d73aeaed81ab2c97c04@o330862.ingest.sentry.io/1851857',
  environment: 'staging',
  release: 'dev',
  enabled: false,
});

document.title = `Shoko Server Web UI ${uiVersion()}`;
const container = document && document.getElementById('app-root');

if (container !== null) {
  const root = createRoot(container);
  root.render(<App />);
}
