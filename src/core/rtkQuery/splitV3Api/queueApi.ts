import { splitV3Api } from '../splitV3Api';

const queueApi = splitV3Api.injectEndpoints({
  endpoints: build => ({
    getQueueOperation: build.mutation<void, { operation: string; queue?: string }>({
      query: ({ operation, queue }) => {
        const url = queue ? `queue/${queue}/${operation}` : `queue/${operation}`;
        return {
          url,
        };
      },
    }),
  }),
});

export const {
  useGetQueueOperationMutation,
} = queueApi;
