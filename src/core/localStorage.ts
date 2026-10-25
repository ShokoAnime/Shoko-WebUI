/* global globalThis */
import { getUiVersion } from '@/core/util';

import type { RootState } from './store';
import type { ApiSessionState } from '@/core/types/api';

const UI_VERSION = getUiVersion();

export const loadState = (): RootState => {
  try {
    const serializedState = JSON.parse(globalThis.sessionStorage.getItem('state') ?? '{}') as RootState;

    // If the version is the same, we can return the state as is from session storage.
    if (serializedState.apiSession?.version === UI_VERSION) {
      // serverLifecycle is ephemeral UI intent (restarting/shutting-down) — don't rehydrate it.
      // Otherwise a reload mid-restart restores stale 'restarting' and traps the user on a stuck StatusPage.
      const { serverLifecycle: _, ...persistedState } = serializedState;
      return persistedState as RootState;
    }

    // If the version is different, we update the apiSession state to the current version and reset other slices.
    if (serializedState.apiSession?.version) {
      return {
        apiSession: {
          ...serializedState.apiSession,
          version: UI_VERSION,
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
        version: UI_VERSION,
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
    // Don't persist serverLifecycle — ephemeral intent; see loadState above.
    const { serverLifecycle: _, ...persistedState } = state;
    globalThis.sessionStorage.setItem('state', JSON.stringify(persistedState));
  } catch (_) { // Ignore write errors.
  }
};

export const clearSessionStorage = () => {
  try {
    globalThis.sessionStorage.clear();
  } catch (_) { // Ignore storage errors, nothing was persisted.
  }
};

export const clearApiSession = () => {
  try {
    globalThis.localStorage.removeItem('apiSession');
  } catch (_) { // Ignore storage errors, nothing was persisted.
  }
};

// Browsers can throw on any storage access (e.g. Firefox's NS_ERROR_FAILURE when site storage is unusable).
export const getStoredTheme = () => {
  try {
    return globalThis.localStorage.getItem('theme');
  } catch (_) {
    return null;
  }
};
