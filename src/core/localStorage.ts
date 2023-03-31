import { get, omit } from 'lodash';

import { RootState } from './store';
import { externalApi } from './rtkQuery/externalApi';
import { logsApi } from './rtkQuery/logsApi';
import { plexApi } from './rtkQuery/plexApi';
import { splitApi } from './rtkQuery/splitApi';
import { splitV3Api } from './rtkQuery/splitV3Api';

import Version from '../../public/version.json';

export const loadState = (): RootState => {
  try {
    const serializedState = JSON.parse(global.sessionStorage.getItem('state') ?? '{}');
    const apiSessionString = global.localStorage.getItem('apiSession');
    if (apiSessionString === null) {
      return {} as any;
    }
    const apiSession = JSON.parse(apiSessionString);
    if (get(apiSession, 'version', '') !== Version.package) { 
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
      global.localStorage.setItem('apiSession', JSON.stringify(state.apiSession));
    }
    global.sessionStorage.setItem('state', serializedState);
  } catch (err) { // Ignore write errors.
  }
};
