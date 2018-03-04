// @flow
import { createAction } from 'redux-actions';
import { SET_AUTOUPDATE } from './actions';
import store from './store';
import history from './history';
import Events from './events';
import { getDelta } from './actions/logs/Delta';

function autoUpdateTick() {
  const location = history.location.pathname;

  if (location === '/dashboard') {
    store.dispatch({ type: Events.DASHBOARD_QUEUE_STATUS, payload: null });
    store.dispatch({ type: Events.DASHBOARD_RECENT_FILES, payload: null });
  } else if (location === '/logs') {
    const state = store.getState();
    const delta = state.settings.other.logDelta;
    let position = 0;
    try {
      // eslint-disable-next-line prefer-destructuring
      position = state.logs.contents.position;
    } catch (ex) {
      console.error('Unable to get log position');
    }
    store.dispatch(getDelta({ delta, position }));
  }
}

let autoupdateTimer = null;

export function setAutoupdate(status: boolean) {
  if (autoupdateTimer !== null) {
    clearInterval(autoupdateTimer);
    autoupdateTimer = null;
  }
  if (status === true) {
    autoupdateTimer = setInterval(autoUpdateTick, 4000);
  }
  return createAction(SET_AUTOUPDATE)(status);
}

export default {};
