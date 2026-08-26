import * as Sentry from '@sentry/react';
import { create } from 'axios';

import Events from '@/core/events';
import store from '@/core/store';
import { isDebug } from '@/core/util';

import type { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

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

// Auth endpoints return the actual apikey in the request/response body - never attach them to a Sentry breadcrumb.
const AUTH_URL_PATTERN = /^\/?auth/i;
const MAX_BODY_LENGTH = 2000;

const truncateBody = (data: unknown) => {
  if (data === undefined) return undefined;
  try {
    const text = typeof data === 'string' ? data : JSON.stringify(data) ?? '';
    return text.length > MAX_BODY_LENGTH ? `${text.slice(0, MAX_BODY_LENGTH)}…[truncated]` : text;
  } catch {
    return undefined;
  }
};

// Records a snapshot of the request and response body as a Sentry breadcrumb so that any error
// captured afterwards (eg. a downstream TypeError from an unexpected shape) has the real payload
// attached, not just the method/url/status that Sentry's automatic http breadcrumbs already provide.
// Also fires for network-level failures with no response (status 0), since config is still available.
const addApiBreadcrumb = (
  config: AxiosRequestConfig | undefined,
  data: unknown,
  status: number | undefined,
  level: 'error' | 'info',
) => {
  if (isDebug()) return;
  const url = config?.url ?? '';
  if (AUTH_URL_PATTERN.test(url)) return;

  Sentry.addBreadcrumb({
    category: 'api-response',
    level,
    data: {
      method: config?.method?.toUpperCase(),
      status,
      url,
      requestParams: truncateBody(config?.params),
      requestBody: truncateBody(config?.data),
      responseBody: truncateBody(data),
    },
  });
};

// The type of response.data depends on the endpoint called. It has to be any.
// We are only adding this interceptor so that we don't have to get response.data every time we call axios from react-query
const unwrapResponse = (response: AxiosResponse) => {
  addApiBreadcrumb(response.config, response.data, response.status, 'info');
  // oxlint-disable-next-line typescript/no-unsafe-return
  return response.data;
};

const handleResponseError = (error: AxiosError) => {
  addApiBreadcrumb(error.config, (error.response as AxiosResponse | undefined)?.data, error.response?.status, 'error');

  // Log out when an authenticated Shoko API request is rejected with 401 (eg. an invalid or revoked apikey).
  // Guards:
  // - `AUTH_URL_PATTERN` excludes auth endpoints themselves - failed logins also return 401.
  // - Path check excludes Plex requests (/plex), which use their own authentication.
  // - `apikey` check ensures this fires only while logged in, and therefore at most once per session.
  const status = error.response?.status;
  const url = error.config?.url ?? '';
  const fullPath = `${error.config?.baseURL ?? ''}${url}`;
  if (
    status === 401
    && !AUTH_URL_PATTERN.test(url)
    && fullPath.startsWith('/api')
    && store.getState().apiSession.apikey
  ) {
    store.dispatch({ type: Events.AUTH_LOGOUT });
  }

  return Promise.reject(error);
};

axios.interceptors.response.use(unwrapResponse, handleResponseError);
axiosV2.interceptors.response.use(unwrapResponse, handleResponseError);
axiosPlex.interceptors.response.use(unwrapResponse, handleResponseError);
// oxlint-disable-next-line typescript/no-unsafe-return
axiosExternal.interceptors.response.use(response => response.data);
