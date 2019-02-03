// @flow
import React from 'react';
import { hot } from 'react-hot-loader';
import { Provider } from 'react-redux';
import history from './history';
import store from './store';
import Router from './router';
import ErrorBoundary from '../pages/error';

const App = () => (
  <Provider store={store}>
    <ErrorBoundary>
      <Router history={history} />
    </ErrorBoundary>
  </Provider>
);

export default hot(module)(App);
