import { Integrations } from '@sentry/tracing';
import * as Sentry from '@sentry/react';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import 'isomorphic-fetch';
import 'es6-promise/auto';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './core/app';
import { uiVersion } from './core/util';

Sentry.init({
  dsn: 'https://f607489ccc764d73aeaed81ab2c97c04@o330862.ingest.sentry.io/1851857',
  beforeSend(event) {
    // Check if it is an exception, and if so, show the report dialog
    if (event.exception) {
      Sentry.showReportDialog({ eventId: event.event_id });
    }
    return event;
  },
  environment: 'production',
  release: uiVersion(),
  integrations: [new Integrations.BrowserTracing()],
  tracesSampleRate: 1.0,
});

const container = document && document.getElementById('app-root');

if (container !== null) {
  ReactDOM.render(<App />, container);
}
