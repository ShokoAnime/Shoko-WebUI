import { RootState } from './store';

export const loadState = (): RootState => {
  try {
    const serializedState = global.localStorage.getItem('state') ?? global.sessionStorage.getItem('state');
    if (serializedState === null) {
      return ({} as any);
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return ({} as any);
  }
};

export const saveState = (state: RootState) => {
  try {
    const serializedState = JSON.stringify(state);
    if (state.apiSession.rememberUser) {
      global.localStorage.setItem('state', serializedState);
    } else {
      global.sessionStorage.setItem('state', serializedState);
    }
  } catch (err) { // Ignore write errors.
  }
};
