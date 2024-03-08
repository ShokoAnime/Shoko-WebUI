import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';

import type { QueueItemsInfiniteRequestType } from '@/core/react-query/queue/types';
import type { ListResultType } from '@/core/types/api';
import type { QueueItemType } from '@/core/types/signalr';

export const useQueueItemsQuery = (params: QueueItemsInfiniteRequestType, enabled = true) =>
  useQuery<ListResultType<QueueItemType>>({
    queryKey: ['queue', 'items', params],
    queryFn: () => axios.get('Queue/Items', { params }),
    enabled,
  });
