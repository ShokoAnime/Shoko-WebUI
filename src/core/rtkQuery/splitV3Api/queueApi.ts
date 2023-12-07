import { splitV3Api } from '@/core/rtkQuery/splitV3Api';

import type { ListResultType, PaginationType } from '@/core/types/api';
import type { QueueItemType } from '@/core/types/api/queue';

const queueApi = splitV3Api.injectEndpoints({
  endpoints: build => ({
    getQueueOperation: build.mutation<void, { operation: string, queue?: string }>({
      query: ({ operation, queue }) => {
        const url = queue ? `Queue/${queue}/${operation}` : `queue/${operation}`;
        return {
          url,
          method: 'POST',
        };
      },
    }),
    getQueueItems: build.query<
      ListResultType<QueueItemType>,
      { queueName: string, showAll?: boolean } & PaginationType
    >({
      query: ({ page = 1, pageSize = 10, queueName, showAll = true }) => ({
        url: `Queue/${queueName}/Items`,
        params: { showAll, page, pageSize },
      }),
      providesTags: ['QueueItems'],
    }),
  }),
});

export const {
  useGetQueueItemsQuery,
  useGetQueueOperationMutation,
  useLazyGetQueueItemsQuery,
} = queueApi;
