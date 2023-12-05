import { splitV3Api } from '@/core/rtkQuery/splitV3Api';

import type { ComponentVersionType } from '@/core/types/api/init';
import type {
  WebuiGroupExtra,
  WebuiSeriesDetailsType,
  WebuiSeriesFileSummaryType,
  WebuiTheme,
} from '@/core/types/api/webui';

export type GroupViewApiRequest = {
  GroupIDs: number[];
  TagFilter: number;
  TagLimit: number;
  OrderByName?: boolean;
};

export type SeriesOverviewApiRequest = {
  SeriesID: string;
};

export type SeriesFileSummaryApiRequest = {
  SeriesID: string;
  groupBy?: string;
};

const webuiApi = splitV3Api.injectEndpoints({
  endpoints: build => ({
    getGroupViewInfinite: build.query<WebuiGroupExtra[], GroupViewApiRequest>({
      query: params => ({ url: 'WebUI/GroupView', body: params, method: 'POST' }),
      // Only have one cache entry because the arg always maps to one string
      serializeQueryArgs: ({ endpointName }) => endpointName,
      // Always merge incoming data to the cache entry
      merge: (currentCache, newItems) => {
        currentCache.push(...newItems);
      },
      // Refetch when the page arg changes
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),

    getSeriesOverview: build.query<WebuiSeriesDetailsType, SeriesOverviewApiRequest>({
      query: ({ SeriesID }) => ({ url: `WebUI/Series/${SeriesID}` }),
    }),

    // Update an existing version of the web ui to the latest for the selected channel.
    getWebuiUpdateCheck: build.query<ComponentVersionType, { channel: 'Stable' | 'Dev', force: boolean }>({
      query: params => ({ url: 'WebUI/LatestVersion', params }),
      providesTags: ['WebUIUpdateCheck'],
      serializeQueryArgs: ({ queryArgs }) => {
        const { channel } = queryArgs;
        return { channel };
      },
    }),

    // Check for latest version for the selected channel and return a Shoko.Server.API.v3.Models.Common.ComponentVersion containing the version information.
    postWebuiUpdate: build.mutation<void, 'Stable' | 'Dev'>({
      query: channel => ({ url: 'WebUI/Update', params: { channel }, method: 'POST' }),
    }),

    // Check for latest version for the selected channel and return a Shoko.Server.API.v3.Models.Common.ComponentVersion containing the version information.
    getSeriesFileSummery: build.query<WebuiSeriesFileSummaryType, SeriesFileSummaryApiRequest>({
      query: ({ SeriesID, ...params }) => ({ url: `WebUI/Series/${SeriesID}/FileSummary`, params }),
    }),

    // Retrieves the list of available themes.
    getWebuiThemes: build.query<WebuiTheme[], void>({
      query: () => ({ url: 'WebUI/Theme', params: { forceRefresh: true } }),
    }),
  }),
});

export const {
  useGetSeriesOverviewQuery,
  useGetWebuiThemesQuery,
  useGetWebuiUpdateCheckQuery,
  useLazyGetGroupViewInfiniteQuery,
  useLazyGetSeriesFileSummeryQuery,
  useLazyGetWebuiUpdateCheckQuery,
  usePostWebuiUpdateMutation,
} = webuiApi;
