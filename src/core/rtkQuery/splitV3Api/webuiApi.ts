import { splitV3Api } from '../splitV3Api';
import { WebuiGroupExtra } from '../../types/api/webui';

export type GroupViewApiRequest = {
  GroupIDs: number[];
  TagFilter: number;
};

const webuiApi = splitV3Api.injectEndpoints({
  endpoints: build => ({
    getGroupView: build.query<WebuiGroupExtra[], GroupViewApiRequest>({
      query: params => ({ url: 'WebUI/GroupView', body: params, method: 'POST' }),
      // Only have one cache entry because the arg always maps to one string
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      // Always merge incoming data to the cache entry
      merge: (currentCache, newItems) => {
        currentCache.push(...newItems);
      },
      // Refetch when the page arg changes
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),
  }),
});

export const { useLazyGetGroupViewQuery } = webuiApi;