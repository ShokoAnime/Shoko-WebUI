/* global globalThis */

import { get } from 'lodash';

import type { RootState } from './store';
import type { ApiSessionState } from '@/core/types/api';

const { VITE_APPVERSION } = import.meta.env;

const checkVersion = (version: string) => version === VITE_APPVERSION;

const isSerializedState = (data: unknown): data is RootState => checkVersion(get(data, 'apiSession.version', ''));
const isApiSession = (data: unknown): data is ApiSessionState => checkVersion(get(data, 'version', ''));

export const loadState = (): RootState => {
  try {
    const serializedState = JSON.parse(globalThis.sessionStorage.getItem('state') ?? '{}') as RootState;
    const apiSessionString = globalThis.localStorage.getItem('apiSession');
    if (apiSessionString === null) {
      return isSerializedState(serializedState) ? serializedState : {} as RootState;
    }
    const apiSession: unknown = JSON.parse(apiSessionString);
    if (!isApiSession(apiSession)) {
      globalThis.localStorage.removeItem('apiSession');
      return {} as RootState;
    }
    return { ...serializedState, apiSession };
  } catch (err) {
    return ({} as RootState);
  }
};

export const saveState = (state: RootState) => {
  try {
    if (state.apiSession.rememberUser) {
      globalThis.localStorage.setItem('apiSession', JSON.stringify(state.apiSession));
    }
    globalThis.sessionStorage.setItem('state', JSON.stringify(state));
  } catch (err) { // Ignore write errors.
  }
};
