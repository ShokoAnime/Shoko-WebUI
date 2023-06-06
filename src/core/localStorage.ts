import { get, omit } from 'lodash';

import { RootState } from './store';
import { externalApi } from './rtkQuery/externalApi';
import { logsApi } from './rtkQuery/logsApi';
import { plexApi } from './rtkQuery/plexApi';
import { splitApi } from './rtkQuery/splitApi';
import { splitV3Api } from './rtkQuery/splitV3Api';

const { VITE_APPVERSION } = import.meta.env;

const checkVersion = (version) => {
  return version === VITE_APPVERSION;
};
export const loadState = (): RootState => {
  try {
    const serializedState = JSON.parse(globalThis.sessionStorage.getItem('state') ?? '{}');
    const apiSessionString = globalThis.localStorage.getItem('apiSession');
    if (apiSessionString === null) {
      return checkVersion(get(serializedState, 'apiSession.version', '')) ? serializedState : {} as any;
    }
    const apiSession = JSON.parse(apiSessionString);
    if (!checkVersion(get(apiSession, 'version', ''))) {
      globalThis.localStorage.clear();
      return {} as any;
    }
    return { ...serializedState, apiSession };
  } catch (err) {
    return ({} as any);
  }
};

export const saveState = (state: RootState) => {
  try {
    const serializedState = JSON.stringify(omit(state, [
      externalApi.reducerPath,
      logsApi.reducerPath,
      plexApi.reducerPath,
      splitApi.reducerPath,
      splitV3Api.reducerPath,
    ]));
    if (state.apiSession.rememberUser) {
      globalThis.localStorage.setItem('apiSession', JSON.stringify(state.apiSession));
    }
    globalThis.sessionStorage.setItem('state', serializedState);
  } catch (err) { // Ignore write errors.
  }
};
