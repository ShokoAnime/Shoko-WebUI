import 'babel-polyfill';
import 'isomorphic-fetch';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from './core/store';
import Router from './core/router';

const container = document.getElementById('app-container'); // eslint-disable-line no-undef

ReactDOM.render(
  <Provider store={store}>
    <Router />
  </Provider>,
  container,
);

