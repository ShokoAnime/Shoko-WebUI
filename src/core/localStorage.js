// @flow
import sessionStorage from 'sessionstorage';
import type { State } from './store';

export const loadState = (): State => {
  try {
    const serializedState = sessionStorage.getItem('state');
    if (serializedState === null) {
      return ({}: any);
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return ({}: any);
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

