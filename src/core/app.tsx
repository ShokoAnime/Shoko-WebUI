import React from 'react';
import { Provider } from 'react-redux';

import ErrorBoundary from '@/pages/error/ErrorPage';
import Router from './router';
import store from './store';

const App = () => (
  <Provider store={store}>
    <ErrorBoundary>
      <Router />
    </ErrorBoundary>
  </Provider>
);

export default App;
