import React from 'react';
import { HotkeysProvider } from 'react-hotkeys-hook';
import { Provider } from 'react-redux';
import * as Sentry from '@sentry/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import queryClient from '@/core/react-query/queryClient';
import Router from '@/core/router';
import store from '@/core/store';

const App = () => (
  <React.StrictMode>
    <Provider store={store}>
      <Sentry.ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <HotkeysProvider initiallyActiveScopes={['primary']}>
            <Router />
          </HotkeysProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </Sentry.ErrorBoundary>
    </Provider>
  </React.StrictMode>
);

export default App;
