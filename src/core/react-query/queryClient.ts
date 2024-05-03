import { QueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import toast from '@/components/Toast';

import type { QueryKey } from '@tanstack/react-query';
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
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

export const invalidateOnEvent = (event: string) => {
  switch (event) {
    case 'FileDeleted':
    case 'FileMoved':
      invalidateQueries(['dashboard']);
      invalidateQueries(['import-folder']);
      invalidateQueries(['files']);
      break;
    case 'FileHashed':
      invalidateQueries(['dashboard', 'stats']);
      invalidateQueries(['import-folder']);
      invalidateQueries(['files']);
      break;
    case 'FileMatched':
      invalidateQueries(['dashboard']);
      invalidateQueries(['import-folder']);
      invalidateQueries(['files']);
      invalidateQueries(['series', 'files']);
      invalidateQueries(['series', 'linked-files']);
      break;
    case 'SeriesUpdated':
      invalidateQueries(['dashboard']);
      break;
    case 'QueueStateChanged':
      invalidateQueries(['queue', 'items']);
      break;
    default:
  }
};

export default queryClient;
