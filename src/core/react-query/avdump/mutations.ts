import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';

import type { AVDumpFileRequestType } from '@/core/react-query/avdump/types';

export const useAvdumpFilesMutation = () =>
  useMutation({
    mutationFn: (data: AVDumpFileRequestType) =>
      axios.post(
        'AVDump/DumpFiles',
        data,
      ),
  });
