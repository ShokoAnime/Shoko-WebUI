// @flow
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import 'isomorphic-fetch';
import 'es6-promise/auto';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './core/app';

const container = document && document.getElementById('app-container');

if (container !== null) {
  ReactDOM.render(<App />, container);
}
