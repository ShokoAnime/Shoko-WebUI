import React from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@material-tailwind/react';
import history from './history';
import store from './store';
import Router from './router';
import ErrorBoundary from '../pages/error/ErrorPage';
import { theme } from './theme';

const App = () => (
  <Provider store={store}>
    <ErrorBoundary>
      <ThemeProvider value={theme}>
        <Router history={history} />
      </ThemeProvider>
    </ErrorBoundary>
  </Provider>
);

export default App;
