
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import 'es6-promise/auto';
import * as Sentry from '@sentry/browser';

import React from 'react';
import ReactDOM from 'react-dom';
import App from './core/app-hmr';
import { uiVersion } from './core/util';

Sentry.init({
  dsn: 'https://f607489ccc764d73aeaed81ab2c97c04@sentry.io/1851857',
  beforeSend(event) {
    // Check if it is an exception, and if so, show the report dialog
    if (event.exception) {
      Sentry.showReportDialog({ eventId: event.event_id });
    }
    return event;
  },
  environment: 'staging',
  release: uiVersion(),
});

document.title = `Shoko Server Web UI ${uiVersion()}`;
const container = document && document.getElementById('app-root');

if (container !== null) {
  ReactDOM.render(<App />, container);
}
