import React from 'react';
import { Provider } from 'react-redux';
import * as Sentry from '@sentry/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import queryClient from '@/core/react-query/queryClient';
import Router from '@/core/router';
import store from '@/core/store';

const App = () => (
  <Provider store={store}>
    <Sentry.ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Sentry.ErrorBoundary>
  </Provider>
);

export default App;
