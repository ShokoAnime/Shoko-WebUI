import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { handleAction } from 'redux-actions';
import {
  SET_AUTOUPDATE, JMM_NEWS, SIDEBAR_TOGGLE, UPDATE_AVAILABLE, JMM_VERSION,
} from './actions';
import modals from './reducers/modals';
import settings from './reducers/settings';
import firstrun from './reducers/firstrun';
import Version from '../../public/version.json';

import apiSessionReducer from './slices/apiSession';
import globalAlertReducer from './slices/globalAlert';
import fetchingReducer from './slices/fetching';
import mainpageReducer from './slices/mainpage';

export function apiReducer(state, action) {
  // return action.error ? state : Object.assign({}, state, action.payload);
  return action.error ? state : Object.assign({}, action.payload);
}

const sidebarToggle = handleAction(
  SIDEBAR_TOGGLE,
  (state, action) => (action.error ? state : action.payload),
  true,
);
const autoUpdate = handleAction(SET_AUTOUPDATE, (state, action) => action.payload, false);

const jmmVersion = handleAction(JMM_VERSION, (state, action) => (action.error ? state : action.payload), '');

const jmmNews = handleAction(JMM_NEWS, apiReducer, {});
export const updateAvailable = handleAction(UPDATE_AVAILABLE, (state, action: any) => {
  if (action.error) { return state; }
  return Version.debug === false && action.payload.version !== Version.package;
}, false);

const reducers = {
  apiSession: apiSessionReducer,
  globalAlert: globalAlertReducer,
  fetching: fetchingReducer,
  mainpage: mainpageReducer,
  autoUpdate,
  jmmNews,
  sidebarToggle,
  updateAvailable,
  jmmVersion,
  settings,
  modals,
  firstrun,
};

export type Reducers = typeof reducers;

export default (history => combineReducers({ router: connectRouter(history), ...reducers }));
