import { QueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import toast from '@/components/Toast';
import Events from '@/core/events';
import store from '@/core/store';

import type { QueryKey } from '@tanstack/react-query';
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000, // To prevent duplicate requests from same page
      refetchOnWindowFocus: false,
      retry: (failureCount, error: AxiosError | Error) => {
        let errorHeader: string;
        let errorMessage: string;
        let errorStatus = 0;

        if (isAxiosError(error)) {
          const { message } = error;
          const { method, url } = error.config as AxiosRequestConfig;
          const { status } = error.response as AxiosResponse ?? {};

          errorHeader = `${method?.toUpperCase()} ${url}`;
          errorMessage = `Error ${status} ${message}`;
          errorStatus = status;
        } else {
          errorHeader = '[API]';
          errorMessage = `Error ${error.message}`;
        }

        if (
          isAxiosError(error) && (error.request as XMLHttpRequest).responseURL.endsWith('/Settings')
          && errorStatus === 401
        ) {
          store.dispatch({ type: Events.AUTH_LOGOUT });
          return false;
        }

        if (errorStatus !== 404 && failureCount < 4) return true; // 1 initial request + retry 4 times

        toast.error(errorHeader, errorMessage);

        return false;
      },
    },
  },
});

export const invalidateQueries = (queryKey: QueryKey) => {
  queryClient.invalidateQueries({ queryKey }).catch(console.error);
};

export const resetQueries = (queryKey: QueryKey) => {
  queryClient.resetQueries({ queryKey }).catch(console.error);
};

export default queryClient;
