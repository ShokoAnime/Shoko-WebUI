import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';

import type { QueueItemsInfiniteRequestType } from '@/core/react-query/queue/types';
import type { QueueItemType } from '@/core/signalr/types';
import type { ListResultType } from '@/core/types/api';

export const useQueueItemsQuery = (params: QueueItemsInfiniteRequestType, enabled = true) =>
  useQuery<ListResultType<QueueItemType>>({
    queryKey: ['queue', 'items', params],
    queryFn: () => axios.get('Queue/Items', { params }),
    enabled,
  });
