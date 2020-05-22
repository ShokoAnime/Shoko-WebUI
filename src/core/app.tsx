
import React from 'react';
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

export default App;
