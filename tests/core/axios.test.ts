import { AxiosError } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { axios, axiosPlex, axiosV2 } from '@/core/axios';
import Events from '@/core/events';

import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios';

// Regression suite for the 401 logout in src/core/axios.ts: a 401 only logs out once the apikey check endpoint
// (User/Current) rejects the apikey too, since endpoints reachable while the server starts 401 every apikey.

const { dispatch, session } = vi.hoisted(() => ({
  dispatch: vi.fn(),
  session: { apikey: 'stored-apikey' },
}));

vi.mock('@/core/store', () => ({
  default: {
    dispatch,
    getState: () => ({ apiSession: session }),
  },
}));
vi.mock('@/core/util', () => ({ isDebug: () => true }));

const logout = { type: Events.AUTH_LOGOUT };

let requests: string[];
let statuses: Record<string, number>;

// Answers each request with the status configured for its full path (200 when none is).
const adapter: AxiosAdapter = (config: InternalAxiosRequestConfig) => {
  const path = `${config.baseURL ?? ''}/${config.url ?? ''}`;
  requests.push(path);
  const response = { config, data: {}, headers: {}, status: statuses[path] ?? 200, statusText: '' };
  if (response.status < 400) return Promise.resolve(response);
  return Promise.reject(new AxiosError('Request failed', AxiosError.ERR_BAD_REQUEST, config, null, response));
};

// Sends a request and waits until it, and any apikey check it started, has settled.
// The adapter settles through microtasks only, so one macrotask tick drains both.
const send = async (request: Promise<unknown>) => {
  await request.catch(() => undefined);
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
};

beforeEach(() => {
  requests = [];
  statuses = {};
  session.apikey = 'stored-apikey';
  dispatch.mockClear();
  for (const client of [axios, axiosV2, axiosPlex]) client.defaults.adapter = adapter;
});

afterEach(() => {
  for (const client of [axios, axiosV2, axiosPlex]) client.defaults.adapter = undefined;
});

describe('401 logout', () => {
  it('logs out when the apikey check rejects the apikey too', async () => {
    statuses = { '/api/v3/Settings': 401, '/api/v3/User/Current': 401 };
    await send(axios.get('Settings'));
    expect(requests).toEqual(['/api/v3/Settings', '/api/v3/User/Current']);
    expect(dispatch).toHaveBeenCalledExactlyOnceWith(logout);
  });

  it('keeps the session while the server is starting', async () => {
    // Settings stays reachable while starting and 401s every apikey; User/Current answers 503 instead.
    statuses = { '/api/v3/Settings': 401, '/api/v3/User/Current': 503 };
    await send(axios.get('Settings'));
    expect(requests).toEqual(['/api/v3/Settings', '/api/v3/User/Current']);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('keeps the session when the apikey check accepts the apikey', async () => {
    statuses = { '/api/v3/Plugin/Something': 401 };
    await send(axios.get('Plugin/Something'));
    expect(requests).toEqual(['/api/v3/Plugin/Something', '/api/v3/User/Current']);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('logs out on a 401 from the apikey check endpoint itself without asking again', async () => {
    statuses = { '/api/v3/User/Current': 401 };
    await send(axios.get('User/Current'));
    expect(requests).toEqual(['/api/v3/User/Current']);
    expect(dispatch).toHaveBeenCalledExactlyOnceWith(logout);
  });

  it('checks the apikey once for concurrent 401s', async () => {
    statuses = { '/api/v3/Settings': 401, '/api/v3/Series': 401, '/api/v3/User/Current': 503 };
    await Promise.all([send(axios.get('Settings')), send(axios.get('Series'))]);
    expect(requests.filter(path => path === '/api/v3/User/Current')).toHaveLength(1);
  });

  it('ignores 401s while logged out, from auth endpoints and from Plex', async () => {
    statuses = { '/api/auth': 401, '/plex/linked': 401, '/api/v3/Settings': 401 };
    await send(axiosV2.get('auth'));
    await send(axiosPlex.get('linked'));
    session.apikey = '';
    await send(axios.get('Settings'));
    expect(requests).not.toContain('/api/v3/User/Current');
    expect(dispatch).not.toHaveBeenCalled();
  });
});
