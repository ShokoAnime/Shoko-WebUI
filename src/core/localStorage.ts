/* global globalThis */
import type { RootState } from './store';
import type { ApiSessionState } from '@/core/types/api';

const { VITE_APPVERSION } = import.meta.env;

export const loadState = (): RootState => {
  try {
    const serializedState = JSON.parse(globalThis.sessionStorage.getItem('state') ?? '{}') as RootState;

    // If the version is the same, we can return the state as is from session storage.
    if (serializedState.apiSession?.version === VITE_APPVERSION) {
      return serializedState;
    }

    // If the version is different, we update the apiSession state to the current version and reset other slices.
    if (serializedState.apiSession?.version) {
      return {
        apiSession: {
          ...serializedState.apiSession,
          version: VITE_APPVERSION,
        },
      } as RootState;
    }

    // If the version is missing above, it's a new session. Check local storage for apiSession.
    const apiSession = JSON.parse(globalThis.localStorage.getItem('apiSession') ?? '{}') as ApiSessionState;

    // If the apiSession is missing from localStorage, we reset the state.
    if (!apiSession.version) return ({} as RootState);

    // Update the apiSession state to the current version and return the state.
    return {
      apiSession: {
        ...apiSession,
        version: VITE_APPVERSION,
      },
    } as RootState;
  } catch (_) {
    return ({} as RootState);
  }
};

export const saveState = (state: RootState) => {
  try {
    if (state.apiSession.rememberUser) {
      globalThis.localStorage.setItem('apiSession', JSON.stringify(state.apiSession));
    }
    globalThis.sessionStorage.setItem('state', JSON.stringify(state));
  } catch (_) { // Ignore write errors.
  }
};

export const clearSessionStorage = () => {
  globalThis.sessionStorage.clear();
};

export const clearApiSession = () => {
  globalThis.localStorage.removeItem('apiSession');
};
