import { splitApi } from './splitApi';

const queueApi = splitApi.injectEndpoints({
  endpoints: build => ({
    getQueueOperation: build.mutation<void, { operation: string; queue?: string }>({
      query: ({ operation, queue }) => ({
        url: `queue/${queue ? queue + '/' : ''}/${operation}`,
      }),
    }),
  }),
});

export const {
  useGetQueueOperationMutation,
} = queueApi;
