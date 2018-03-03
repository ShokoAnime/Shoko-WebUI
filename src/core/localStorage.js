// @flow
import sessionStorage from 'sessionstorage';
import type { State } from './store';
import rootReducer from './reducers';

export const loadState = (): State => {
  try {
    const serializedState = sessionStorage.getItem('state');
    if (serializedState === null) {
      return rootReducer();
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return rootReducer();
  }
};

export const saveState = (state: State) => {
  try {
    const serializedState = JSON.stringify(state);
    sessionStorage.setItem('state', serializedState);
  } catch (err) {
    // Ignore write errors.
  }
};

