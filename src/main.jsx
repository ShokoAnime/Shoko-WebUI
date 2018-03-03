// @flow
import 'babel-polyfill';
import 'isomorphic-fetch';
import 'es6-promise/auto';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from './core/store';
import Router from './core/router';
import ErrorBoundary from './pages/error';

const container = document && document.getElementById('app-container');
if (container !== null) {
  ReactDOM.render(
    <Provider store={store}>
      <ErrorBoundary>
        <Router />
      </ErrorBoundary>
    </Provider>,
    container,
  );
}
