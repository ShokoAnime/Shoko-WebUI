import { RootState } from './store';
import { omit } from 'lodash';

export const loadState = (): RootState => {
  try {
    const serializedStateString = global.localStorage.getItem('state') ?? global.sessionStorage.getItem('state');
    const serializedState = JSON.parse(serializedStateString ?? '{}');
    const tempStateString = global.sessionStorage.getItem('tempState');
    if (tempStateString === null) {
      return serializedState;
    }
    const tempState = JSON.parse(tempStateString);
    return { ...serializedState, tempState };
  } catch (err) {
    return ({} as any);
  }
};

export const saveState = (state: RootState) => {
  try {
    const serializedState = JSON.stringify(omit(state, ['tempState']));
    const tempState = JSON.stringify(state.tempState);
    if (state.apiSession.rememberUser) {
      global.localStorage.setItem('state', serializedState);
    } else {
      global.sessionStorage.setItem('state', serializedState);
    }
    global.sessionStorage.setItem('tempState', tempState);
  } catch (err) { // Ignore write errors.
  }
};
