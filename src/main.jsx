// @flow
import 'babel-polyfill';
import 'isomorphic-fetch';
import 'es6-promise/auto';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { AppContainer } from 'react-hot-loader';
import history from './core/history';
import store from './core/store';
import Router from './core/router';
import ErrorBoundary from './pages/error';

const container = document && document.getElementById('app-container');
const render = () => {
  if (!container) { return; }
  ReactDOM.render(
    <AppContainer>
      <Provider store={store}>
        <ErrorBoundary>
          <Router history={history} />
        </ErrorBoundary>
      </Provider>
    </AppContainer>,
    container,
  );
};

if (container !== null) {
  render();
}

if (module.hot) {
  module.hot.accept('./core/router', () => {
    render();
  });
}
