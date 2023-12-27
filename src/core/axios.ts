import axiosDefault from 'axios';

import store from '@/core/store';

import type { InternalAxiosRequestConfig } from 'axios';

export const axios = axiosDefault.create({
  baseURL: '/api/v3',
  // Removes square brackets from parameter names in get queries
  // eg. For GET /File, without setting this to null, `sortOrder` parameter is sent as `sortOrder[]`
  paramsSerializer: {
    indexes: null,
  },
});

export const axiosV2 = axiosDefault.create({
  baseURL: '/api',
});

export const axiosPlex = axiosDefault.create({
  baseURL: '/api/plex',
});

export const axiosExternal = axiosDefault.create();

const addApikeyInterceptor = (config: InternalAxiosRequestConfig) => {
  const tempConfig = config;
  tempConfig.headers.apikey = (store.getState()).apiSession.apikey;
  return tempConfig;
};

axios.interceptors.request.use(addApikeyInterceptor);
axiosV2.interceptors.request.use(addApikeyInterceptor);
axiosPlex.interceptors.request.use(addApikeyInterceptor);

// The type of response.data depends on the endpoint called. It has to be any.
// We are only adding this interceptor so that we don't have to get response.data every time we call axios from react-query
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
axios.interceptors.response.use(response => response.data);
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
axiosV2.interceptors.response.use(response => response.data);
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
axiosPlex.interceptors.response.use(response => response.data);
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
axiosExternal.interceptors.response.use(response => response.data);
