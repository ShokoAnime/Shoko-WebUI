import { splitV3Api } from '../splitV3Api';
import type { WebuiGroupExtra } from '../../types/api/webui';
import type { ComponentVersionType } from '../../types/api/init';

export type GroupViewApiRequest = {
  GroupIDs: number[];
  TagFilter: number;
  TagLimit: number;
  OrderByName: boolean;
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

    // Update an existing version of the web ui to the latest for the selected channel.
    getWebuiUpdateCheck: build.query<ComponentVersionType, 'Stable' | 'Dev'>({
      query: channel => ({ url: 'WebUI/LatestVersion', params: { channel } }),
      providesTags: ['WebUIUpdateCheck'],
    }),

    // Check for latest version for the selected channel and return a Shoko.Server.API.v3.Models.Common.ComponentVersion containing the version information.
    getWebuiUpdate: build.mutation<void, 'Stable' | 'Dev'>({
      query: channel => ({ url: 'WebUI/Update', params: { channel } }),
    }),
  }),
});

export const {
  useLazyGetGroupViewQuery,
  useGetWebuiUpdateCheckQuery,
  useGetWebuiUpdateMutation,
} = webuiApi;
