import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { dayjs, downloadBlob } from '@/core/util';

import type { LogsSearchParamsType } from '@/core/react-query/logging/types';

export const useLogsDownloadMutation = () =>
  useMutation<Blob, unknown, LogsSearchParamsType>({
    mutationFn: ({ levels, search }) => {
      // Same derivation as filtersActive in LogsPage: any active filter switches
      // from the current-file download to a range download with those filters.
      const filtersActive = levels.size > 0 || search !== '';
      return axios.get(
        filtersActive ? 'Logging/Range/Download' : 'Logging/File/Current/Download',
        {
          responseType: 'blob',
          params: filtersActive
            ? {
              level: [...levels].sort().join(',') || undefined,
              message: search || undefined,
            }
            : undefined,
        },
      );
    },
    onSuccess: (blob) => {
      // The shared axios instance unwraps response.data in an interceptor, so the
      // Content-Disposition header (and its server-side filename) is not reachable;
      // derive a local filename instead.
      downloadBlob(blob, `shoko-logs-${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.txt`);
    },
  });
