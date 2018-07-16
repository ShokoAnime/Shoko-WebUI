// @flow
import { combineReducers } from 'redux';
import { handleAction } from 'redux-actions';
import {
  FIRSTRUN_ANIDB,
  FIRSTRUN_DATABASE,
  FIRSTRUN_STATUS,
  FIRSTRUN_USER,
} from '../actions/firstrun';

const defaultState = { status: {} };

const status = handleAction(FIRSTRUN_STATUS, (state, action) => {
  if (action.error) { return state; }
  return Object.assign({}, state, action.payload || {});
}, {});

const database = handleAction(FIRSTRUN_DATABASE, (state, action) => {
  if (action.error) { return state; }
  return Object.assign({}, state, defaultState, action.payload || {});
}, defaultState);

const anidb = handleAction(FIRSTRUN_ANIDB, (state, action) => {
  if (action.error) { return state; }
  return Object.assign({}, state, defaultState, action.payload || {});
}, defaultState);

const user = handleAction(FIRSTRUN_USER, (state, action) => {
  if (action.error) { return state; }
  return Object.assign({}, state, defaultState, action.payload || {});
}, defaultState);

export default combineReducers({
  database,
  status,
  anidb,
  user,
});
