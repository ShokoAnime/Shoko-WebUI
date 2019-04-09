// @flow
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import 'es6-promise/auto';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './core/app-hmr';
import { uiVersion } from './core/util';

document.title = `Shoko Server Web UI ${uiVersion()}`;
const container = document && document.getElementById('app-container');

if (container !== null) {
  ReactDOM.render(<App />, container);
}
