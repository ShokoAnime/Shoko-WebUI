import { MutationCache, QueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import toast from '@/core/toast';

import type { QueryKey } from '@tanstack/react-query';
import type { AxiosError, AxiosResponse } from 'axios';

type ShokoErrorData = {
  Detail?: string;
  Message?: string;
  detail?: string;
  errors?: Record<string, string[]>;
};

// Extracts a readable message across all known Shoko server error shapes:
// - v3 ValidationProblemDetails: `{ detail | Detail, errors: { field: [msg] } }`
//   (Detail is often null; useful text lives in `errors`)
// - v3 object errors (412/409/424 plugin/package): `{ Message }` (PascalCase)
// - v3 simple errors (NotFound/BadRequest(msg), 503 middleware): JSON/plain string body
const extractServerErrorMessage = (data: unknown): string | undefined => {
  if (typeof data === 'string') return data.length > 0 ? data : undefined;
  if (data === null || typeof data !== 'object') return undefined;

  const errorData = data as ShokoErrorData;
  const detail = errorData.detail ?? errorData.Detail;
  if (detail != null && detail.length > 0) return detail;

  if (errorData.errors) {
    const fieldMessages = Object.values(errorData.errors).flat().filter(fieldMessage => fieldMessage.length > 0);
    if (fieldMessages.length > 0) return fieldMessages.join(' ');
  }

  return errorData.Message ?? undefined;
};

const processError = (error: AxiosError | Error) => {
  let errorHeader: string;
  let errorMessage: string;
  let errorStatus = 0;

  if (isAxiosError(error)) {
    const { config, message } = error;
    const { method, url } = config ?? {};
    const { data, status } = (error.response ?? {}) as Partial<AxiosResponse<unknown>>;

    errorHeader = `Error ${status}: ${method?.toUpperCase()} ${url}`;
    errorMessage = extractServerErrorMessage(data) ?? message;
    errorStatus = status ?? 0;
  } else {
    errorHeader = '[API]';
    errorMessage = `Error ${error.message}`;
  }

  return {
    header: errorHeader,
    message: errorMessage,
    status: errorStatus,
  };
};

const RETRY_LIMIT = 4;
// Transient client-side failures worth retrying (server will accept the same request later).
const RETRYABLE_STATUSES = new Set([408, 425, 429]);

// Retries only transient failures: network errors (no response), request timeouts,
// rate limiting, and server errors. Other client errors (4xx) fail identically on
// retry and are given up immediately.
const shouldRetryQuery = (failureCount: number, status: number) => {
  if (failureCount >= RETRY_LIMIT) return false;
  // status 0 = network error / no HTTP response
  if (status === 0) return true;
  return status >= 500 || RETRYABLE_STATUSES.has(status);
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000, // To prevent duplicate requests from same page
      refetchOnWindowFocus: false,
      retry: (failureCount, error: AxiosError | Error) => {
        const { header, message, status } = processError(error);

        if (shouldRetryQuery(failureCount, status)) return true; // 1 initial request + retry up to 4 times

        // Deduplicates identical error toasts: react-toastify skips a new toast while
        // one with the same `toastId` is still active.
        const errorToastId = `query-error-${`${header} ${message}`.replace(/[^a-zA-Z\d]+/g, '-')}`;
        toast.error(header, message, { toastId: errorToastId });

        return false;
      },
    },
  },
  mutationCache: new MutationCache({
    onError: (error: AxiosError | Error) => {
      const { header, message } = processError(error);
      toast.error(header, message);
    },
  }),
});

export const invalidateQueries = (queryKey: QueryKey) => {
  queryClient.invalidateQueries({ queryKey }).catch(console.error);
};

export const resetQueries = (queryKey: QueryKey) => {
  queryClient.resetQueries({ queryKey }).catch(console.error);
};

export default queryClient;
