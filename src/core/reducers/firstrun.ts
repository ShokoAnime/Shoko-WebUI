import { combineReducers } from 'redux';
import { handleAction } from 'redux-actions';
import {
  FIRSTRUN_ANIDB, FIRSTRUN_DATABASE, FIRSTRUN_STATUS, FIRSTRUN_USER, FIRSTRUN_ACTIVE_TAB,
} from '../actions/firstrun';

const defaultState = { status: { type: '', text: '' } };
const defaultUserState = { ...defaultState, login: '', password: '' };
const defaultAniDBState = { ...defaultUserState, port: '' };
const defaultDatabaseState = {
  ...defaultState,
  db_type: '',
  sqlserver_databaseserver: '',
  sqlserver_databasename: '',
  sqlserver_username: '',
  sqlserver_password: '',
  sqlite_databasefile: '',
  mysql_hostname: '',
  mysql_schemaname: '',
  mysql_username: '',
  mysql_password: '',
};

const status = handleAction(FIRSTRUN_STATUS, (state, action) => {
  if (action.error) { return state; }
  return Object.assign({}, state, action.payload || { server_started: false, first_run: false });
}, { server_started: false, first_run: false });

const database = handleAction(FIRSTRUN_DATABASE, (state, action) => {
  if (action.error) { return state; }
  return Object.assign({}, state, defaultState, action.payload || defaultDatabaseState);
}, defaultDatabaseState);

const anidb = handleAction(FIRSTRUN_ANIDB, (state, action) => {
  if (action.error) { return state; }
  return Object.assign({}, state, defaultState, action.payload || defaultAniDBState);
}, defaultAniDBState);

const user = handleAction(FIRSTRUN_USER, (state, action) => {
  if (action.error) { return state; }
  return Object.assign({}, state, defaultState, action.payload || defaultUserState);
}, defaultUserState);

const activeTab = handleAction(FIRSTRUN_ACTIVE_TAB, (state, action) => {
  if (action.error) { return state; }
  return action.payload as string;
}, 'tab-acknowledgement');

export default combineReducers({
  database,
  status,
  anidb,
  user,
  activeTab,
});
