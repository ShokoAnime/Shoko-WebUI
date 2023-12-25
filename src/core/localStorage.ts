/* global globalThis */

import { get } from 'lodash';

import type { RootState } from './store';

const { VITE_APPVERSION } = import.meta.env;

const checkVersion = (version: string) => version === VITE_APPVERSION;
export const loadState = (): RootState => {
  try {
    const serializedState: unknown = JSON.parse(globalThis.sessionStorage.getItem('state') ?? '{}');
    const apiSessionString = globalThis.localStorage.getItem('apiSession');
    if (apiSessionString === null) {
      return checkVersion(get(serializedState, 'apiSession.version', '')) ? serializedState : {} as RootState;
    }
    const apiSession = JSON.parse(apiSessionString);
    if (!checkVersion(get(apiSession, 'version', ''))) {
      globalThis.localStorage.clear();
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
