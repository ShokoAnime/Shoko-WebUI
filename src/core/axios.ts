import * as Sentry from '@sentry/react';
import { create } from 'axios';

import store from '@/core/store';
import { isDebug } from '@/core/util';

import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

export const axios = create({
  baseURL: '/api/v3',
  // Removes square brackets from parameter names in get queries
  // eg. For GET /File, without setting this to null, `sortOrder` parameter is sent as `sortOrder[]`
  paramsSerializer: {
    indexes: null,
  },
});

export const axiosV2 = create({
  baseURL: '/api',
});

export const axiosPlex = create({
  baseURL: '/plex',
});

export const axiosExternal = create();

const addApikeyInterceptor = (config: InternalAxiosRequestConfig) => {
  const tempConfig = config;
  tempConfig.headers.apikey = (store.getState()).apiSession.apikey;
  return tempConfig;
};

axios.interceptors.request.use(addApikeyInterceptor);
axiosV2.interceptors.request.use(addApikeyInterceptor);
axiosPlex.interceptors.request.use(addApikeyInterceptor);

// Auth endpoints return the actual apikey in the response body - never attach it to a Sentry breadcrumb.
const AUTH_URL_PATTERN = /^\/?auth/i;
const MAX_BODY_LENGTH = 2000;

const truncateBody = (data: unknown) => {
  try {
    const text = JSON.stringify(data) ?? '';
    return text.length > MAX_BODY_LENGTH ? `${text.slice(0, MAX_BODY_LENGTH)}…[truncated]` : text;
  } catch {
    return undefined;
  }
};

// Records a snapshot of the response body as a Sentry breadcrumb so that any error captured
// afterwards (eg. a downstream TypeError from an unexpected shape) has the real payload attached,
// not just the method/url/status that Sentry's automatic http breadcrumbs already provide.
const addResponseBreadcrumb = (response: AxiosResponse, level: 'error' | 'info') => {
  if (isDebug()) return;
  const url = response.config?.url ?? '';
  if (AUTH_URL_PATTERN.test(url)) return;

  Sentry.addBreadcrumb({
    category: 'api-response',
    level,
    data: {
      method: response.config?.method?.toUpperCase(),
      status: response.status,
      url,
      body: truncateBody(response.data),
    },
  });
};

// The type of response.data depends on the endpoint called. It has to be any.
// We are only adding this interceptor so that we don't have to get response.data every time we call axios from react-query
const unwrapResponse = (response: AxiosResponse) => {
  addResponseBreadcrumb(response, 'info');
  // oxlint-disable-next-line typescript/no-unsafe-return
  return response.data;
};

const handleResponseError = (error: AxiosError) => {
  if (error.response) addResponseBreadcrumb(error.response, 'error');
  return Promise.reject(error);
};

axios.interceptors.response.use(unwrapResponse, handleResponseError);
axiosV2.interceptors.response.use(unwrapResponse, handleResponseError);
axiosPlex.interceptors.response.use(unwrapResponse, handleResponseError);
// oxlint-disable-next-line typescript/no-unsafe-return
axiosExternal.interceptors.response.use(response => response.data);
