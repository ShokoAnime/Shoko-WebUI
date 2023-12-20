import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';

import type { QueueItemsInfiniteRequestType } from '@/core/react-query/queue/types';
import type { ListResultType } from '@/core/types/api';
import type { QueueItemType } from '@/core/types/api/queue';

export const useQueueItemsQuery = (queueName: string, params: QueueItemsInfiniteRequestType, enabled = true) =>
  useQuery<ListResultType<QueueItemType>>({
    queryKey: ['queue', 'items', queueName, params],
    queryFn: () => axios.get(`Queue/${queueName}/Items`, { params }),
    enabled,
  });
