import { splitApi } from '../splitApi';

import type { WebUIVersionType } from '../../types/api';

const webuiApi = splitApi.injectEndpoints({
  endpoints: build => ({
    // Check for newest webui version
    getWebuiLatest: build.mutation<WebUIVersionType, string>({
      query: channel => ({ url: `webui/latest/${channel}` }),
    }),

    // Update webui
    getWebuiUpdate: build.mutation<void, string>({
      query: channel => ({ url: `webui/update/${channel}` }),
    }),
  }),
});

export const {
  useGetWebuiLatestMutation,
  useGetWebuiUpdateMutation,
} = webuiApi;
