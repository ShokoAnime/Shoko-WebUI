import { ListResultType, PaginationType } from '@/core/types/api';
import { QueueItemType } from '@/core/types/api/queue';
import { splitV3Api } from '../splitV3Api';

const queueApi = splitV3Api.injectEndpoints({
  endpoints: build => ({
    getQueueOperation: build.mutation<void, { operation: string; queue?: string }>({
      query: ({ operation, queue }) => {
        const url = queue ? `Queue/${queue}/${operation}` : `queue/${operation}`;
        return {
          url,
          method: 'POST',
        };
      },
    }),
    getQueueItems: build.query<ListResultType<QueueItemType[]>, { queueName: string; showAll?: boolean } & PaginationType>({
      query: ({ queueName, showAll = true, page = 1, pageSize = 10 }) => ({
        url: `Queue/${queueName}/Items`,
        params: { showAll, page, pageSize },
      }),
      providesTags: ['QueueItems'],
    }),
  }),
});

export const {
  useGetQueueOperationMutation,
  useGetQueueItemsQuery,
  useLazyGetQueueItemsQuery,
} = queueApi;
