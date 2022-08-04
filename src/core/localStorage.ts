import { RootState } from './store';

export const loadState = (): RootState => {
  try {
    const serializedState = JSON.parse(global.sessionStorage.getItem('state') ?? '{}');
    const apiSessionString = global.localStorage.getItem('apiSession');
    if (apiSessionString === null) {
      return serializedState;
    }
    const apiSession = JSON.parse(apiSessionString);
    return { ...serializedState, apiSession };
  } catch (err) {
    return ({} as any);
  }
};

export const saveState = (state: RootState) => {
  try {
    const serializedState = JSON.stringify(state);
    if (state.apiSession.rememberUser) {
      global.localStorage.setItem('apiSession', JSON.stringify(state.apiSession));
    }
    global.sessionStorage.setItem('state', serializedState);
  } catch (err) { // Ignore write errors.
  }
};
