import axiosDefault from 'axios';

import store from '@/core/store';

import type { RootState } from '@/core/store';
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
  tempConfig.headers.apikey = (store.getState() as RootState).apiSession.apikey;
  return tempConfig;
};

axios.interceptors.request.use(addApikeyInterceptor);
axiosV2.interceptors.request.use(addApikeyInterceptor);
axiosPlex.interceptors.request.use(addApikeyInterceptor);

axios.interceptors.response.use(response => response.data);
axiosV2.interceptors.response.use(response => response.data);
axiosPlex.interceptors.response.use(response => response.data);
axiosExternal.interceptors.response.use(response => response.data);
