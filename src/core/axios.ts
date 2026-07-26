import { create } from 'axios';

import { validateResponse } from '@/core/api/validateResponse';
import store from '@/core/store';

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type { ZodType } from 'zod';

declare module 'axios' {
  // Declaration merging requires `interface` (a `type` alias can't be augmented)
  // and the exact same generic parameter list as axios's own declaration.
  // oxlint-disable-next-line typescript/consistent-type-definitions typescript/no-explicit-any
  export interface AxiosRequestConfig<D = any> {
    /** When set, the response interceptor validates the raw response against this schema and throws `SchemaValidationError` on mismatch. */
    schema?: ZodType;
  }
}

type SchemaRequestConfig<T, D = unknown> = AxiosRequestConfig<D> & { schema: ZodType<T> };

// Mirrors axios's own untyped default (`T = any`) for the fallback (no
// `schema`) overload below, so endpoint folders not yet passing `schema`
// keep compiling exactly as before.
// oxlint-disable-next-line typescript/no-explicit-any
type UntypedFallback = any;

type ValidatingHttpMethods = {
  get<T>(url: string, config: SchemaRequestConfig<T>): Promise<T>;
  get<T = UntypedFallback>(url: string, config?: AxiosRequestConfig): Promise<T>;

  post<T>(url: string, data: unknown, config: SchemaRequestConfig<T>): Promise<T>;
  post<T = UntypedFallback, D = UntypedFallback>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T>;

  put<T>(url: string, data: unknown, config: SchemaRequestConfig<T>): Promise<T>;
  put<T = UntypedFallback, D = UntypedFallback>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T>;

  patch<T>(url: string, data: unknown, config: SchemaRequestConfig<T>): Promise<T>;
  patch<T = UntypedFallback, D = UntypedFallback>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T>;

  delete<T>(url: string, config: SchemaRequestConfig<T>): Promise<T>;
  delete<T = UntypedFallback>(url: string, config?: AxiosRequestConfig): Promise<T>;
};

// Callers can pass `schema` in the request config to get both the parsed
// return type and automatic runtime validation (see the response
// interceptor below) — e.g. `axios.get(url, { params, schema: FooResponse })`
// resolves to `Promise<z.infer<typeof FooResponse>>` instead of `any`, with
// no per-call-site `.then(validateResponse(...))` needed. Omitting `schema`
// falls back to today's untyped behavior.
type ValidatingAxiosInstance = Omit<AxiosInstance, keyof ValidatingHttpMethods> & ValidatingHttpMethods;

const axiosV3Instance = create({
  baseURL: '/api/v3',
  // Removes square brackets from parameter names in get queries
  // eg. For GET /File, without setting this to null, `sortOrder` parameter is sent as `sortOrder[]`
  paramsSerializer: {
    indexes: null,
  },
});

const axiosV2Instance = create({
  baseURL: '/api',
});

const axiosPlexInstance = create({
  baseURL: '/plex',
});

export const axiosExternal = create();

const addApikeyInterceptor = (config: InternalAxiosRequestConfig) => {
  const tempConfig = config;
  tempConfig.headers.apikey = (store.getState()).apiSession.apikey;
  return tempConfig;
};

axiosV3Instance.interceptors.request.use(addApikeyInterceptor);
axiosV2Instance.interceptors.request.use(addApikeyInterceptor);
axiosPlexInstance.interceptors.request.use(addApikeyInterceptor);

// The type of response.data depends on the endpoint called. It has to be any.
// We are only adding this interceptor so that we don't have to get response.data every time we call axios from react-query.
// When the request config carries a `schema`, validate the raw response against it before unwrapping.
const unwrapAndValidateResponse = (response: AxiosResponse) => {
  const { schema } = response.config;
  // oxlint-disable-next-line typescript/no-unsafe-return
  if (!schema) return response.data;

  const { method, url } = response.config;
  return validateResponse(schema, response.data, `${method?.toUpperCase()} ${url}`);
};

axiosV3Instance.interceptors.response.use(unwrapAndValidateResponse);
axiosV2Instance.interceptors.response.use(unwrapAndValidateResponse);
axiosPlexInstance.interceptors.response.use(unwrapAndValidateResponse);
// oxlint-disable-next-line typescript/no-unsafe-return
axiosExternal.interceptors.response.use(response => response.data);

export const axios = axiosV3Instance as unknown as ValidatingAxiosInstance;
export const axiosV2 = axiosV2Instance as unknown as ValidatingAxiosInstance;
export const axiosPlex = axiosPlexInstance as unknown as ValidatingAxiosInstance;
