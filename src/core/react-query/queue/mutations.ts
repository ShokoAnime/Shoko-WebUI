import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';

import type { QueueOperationRequestType } from '@/core/react-query/queue/types';

export const useQueueOperationMutation = () =>
  useMutation({
    mutationFn: ({ operation, queue }: QueueOperationRequestType) =>
      axios.post(queue ? `Queue/${queue}/${operation}` : `Queue/${operation}`),
  });
