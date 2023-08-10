import { splitV3Api } from '@/core/rtkQuery/splitV3Api';

const actionsApi = splitV3Api.injectEndpoints({
  endpoints: build => ({
    // Run action
    runAction: build.mutation<void, string>({
      query: action => ({ url: `Action/${action}` }),
    }),
  }),
});

export const {
  useRunActionMutation,
} = actionsApi;
