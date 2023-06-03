import { splitApi } from '../splitApi';

import type { TraktCodeType } from '@/core/types/api';

const traktApi = splitApi.injectEndpoints({
  endpoints: build => ({
    // Get Trakt code and url.
    getTraktCode: build.query<TraktCodeType, void>({
      query: () => ({ url: 'trakt/code' }),
    }),
  }),
});

export const {
  useLazyGetTraktCodeQuery,
} = traktApi;
