import 'babel-polyfill';
import 'isomorphic-fetch';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import store from './core/store';
import router from './core/router';
import history from './core/history';

let routes = require('./routes.json');
const container = document.getElementById('app-container');

function renderComponent(component) {
  ReactDOM.render(<Provider store={store}>{component}</Provider>, container);
}

function render(location) {
  router.resolve(routes, location)
    .then(renderComponent)
    .catch(error => router.resolve(routes, { ...location, error }).then(renderComponent));
}

history.listen(render);
render(history.getCurrentLocation());

if (module.hot) {
  module.hot.accept('./routes.json', () => {
    routes = require('./routes.json'); // eslint-disable-line global-require
    render(history.getCurrentLocation());
  });
}