import { QueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import toast from '@/components/Toast';

import type { QueryKey } from '@tanstack/react-query';
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: AxiosError | Error) => {
        if (failureCount < 4) return true; // 1 initial request + retry 4 times

        if (isAxiosError(error)) {
          const { message } = error;
          const { method, url } = error.config as AxiosRequestConfig;
          const { status } = error.response as AxiosResponse ?? {};

          toast.error(`${method?.toUpperCase()} ${url}`, `Error ${status} ${message}`);
        } else {
          toast.error('[API]', `Error ${error.message}`);
        }

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
    default:
  }
};

export default queryClient;
