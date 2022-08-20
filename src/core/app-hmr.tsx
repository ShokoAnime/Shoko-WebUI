import React from 'react';
import { Provider } from 'react-redux';
import history from './history';
import store from './store';
import Router from './router';
import ErrorBoundary from '../pages/error/ErrorPage';

import { ThemeProvider } from '@material-tailwind/react';

const App = () => (
  <Provider store={store}>
    <ErrorBoundary>
      <ThemeProvider>
        <Router history={history} />
      </ThemeProvider>
    </ErrorBoundary>
  </Provider>
);

export default App;
