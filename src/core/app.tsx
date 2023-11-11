import React from 'react';
import { Provider } from 'react-redux';
import * as Sentry from '@sentry/react';

import Router from './router';
import store from './store';

const App = () => (
  <Provider store={store}>
    <Sentry.ErrorBoundary>
      <Router />
    </Sentry.ErrorBoundary>
  </Provider>
);

export default App;
