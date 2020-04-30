// @flow
import type { Saga } from 'redux-saga';
import {
  all, call, put, select, takeEvery, delay,
} from 'redux-saga/effects';
import {
  capitalize, forEach, map, without,
} from 'lodash';
import { push } from 'connected-react-router';
import { createAction } from 'redux-actions';
import ApiCommon from '../api/common';
import ApiActions from '../api/actions';
import Events from '../events';
import Dashboard from './dashboard';
import {
  apiSession,
  GLOBAL_ALERT,
  IMPORT_FOLDER_SERIES,
  JMM_VERSION,
  LOGOUT,
  QUEUE_GLOBAL_ALERT,
  SELECT_IMPORT_FOLDER_SERIES,
  SET_FETCHING,
  SHOW_GLOBAL_ALERT,
  UPDATE_AVAILABLE,
} from '../actions';
import { SETTINGS_API_GET } from '../actions/settings/Api';
import { SET_NOTIFICATIONS, SET_THEME } from '../actions/settings/UI';
import { SET_LOG_DELTA, SET_UPDATE_CHANNEL } from '../actions/settings/Other';
import { GET_LOG } from '../actions/settings/Log';
import { SETTINGS_JSON } from '../actions/settings/Json';
import {
  FIRSTRUN_ANIDB,
  FIRSTRUN_DATABASE,
  FIRSTRUN_STATUS,
  FIRSTRUN_USER,
} from '../actions/firstrun';
import {
  API_ADD_FOLDER,
  API_EDIT_FOLDER,
  SET_FORM_DATA,
  SET_STATUS,
} from '../actions/modals/ImportFolder';
import {
  setItems as setBrowseModalItems,
  setId as setBrowseModalId,
} from '../actions/modals/BrowseFolder';
import queueGlobalAlert from './QueueGlobalAlert';
import apiPollingDriver from './apiPollingDriver';
import settings from './settings';

const dispatchAction = (type, payload) => put(createAction(type)(payload));

// TODO: separate into submodules, for now we just put all sagas in one file

/* ALERT SYSTEM */
const maxAlerts = 2;
const alertDisplayTime = 3000;
let activeAlerts = [];

function* alertScheduler(action): Saga<void> {
  const alert = action.payload;
  if (activeAlerts.length < maxAlerts) {
    activeAlerts = [...activeAlerts, alert];
    yield put({ type: GLOBAL_ALERT, payload: activeAlerts });
    yield delay(alertDisplayTime);
    activeAlerts = without(activeAlerts, alert);
    yield put({ type: GLOBAL_ALERT, payload: activeAlerts });
  } else {
    yield delay(alertDisplayTime / 2);
    yield put({ type: SHOW_GLOBAL_ALERT, payload: alert });
  }
}

/* ALERT SYSTEM */

function* getSettings(): Saga<void> {
  const resultJson = yield call(ApiCommon.getWebuiConfig);

  if (resultJson.error) {
    if (resultJson.code === 404) { return; }
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }
  const { data } = resultJson;

  yield put({ type: SET_THEME, payload: data.uiTheme });
  yield put({ type: SET_NOTIFICATIONS, payload: data.uiNotifications });
  yield put({ type: SET_LOG_DELTA, payload: data.otherLogDelta });
  yield put({ type: SET_UPDATE_CHANNEL, payload: data.otherUpdateChannel });
}

function* settingsExport(): Saga<void> {
  const resultJson = yield call(ApiCommon.configExport);

  if (resultJson.error) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }
  const data = JSON.stringify(resultJson.data);

  yield put({ type: SETTINGS_JSON, payload: data });
}

function* settingsImport(action): Saga<void> {
  const resultJson = yield call(ApiCommon.configImport.bind(this, action.payload));

  if (resultJson.error) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
  }
}

function* pageSettingsLoad(): Saga<void> {
  yield call(Dashboard.updateOverview);

  const resultJson = yield call(ApiCommon.getLogRotate);
  if (resultJson.error) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }
  const { data } = resultJson;

  yield put({ type: GET_LOG, payload: data });
}

function* settingsSaveLogRotate(action): Saga<void> {
  const resultJson = yield call(ApiCommon.postLogRotate.bind(this, action.payload));
  if (resultJson.error) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
  } else {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'success', text: 'Log settings saved!' } });
  }
}

function* runQuickAction(action): Saga<void> {
  const { payload } = action;
  const capitalizedName = map(payload.split('-'), word => capitalize(word)).join('');
  const funcName = `get${capitalizedName}`;

  if (typeof ApiActions[funcName] !== 'function') {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: 'Unknown action!' } });
    return;
  }

  const resultJson = yield call(ApiActions[funcName]);
  if (resultJson.error) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
  } else {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'success', text: 'Request sent!' } });
  }
}

function* addFolder(action): Saga<void> {
  yield put({ type: API_ADD_FOLDER, payload: { isFetching: true } });
  const resultJson = yield call(ApiCommon.postFolderAdd.bind(this, action.payload));
  yield put({ type: API_ADD_FOLDER, payload: { ...resultJson, isFetching: false } });

  const resultList = yield call(ApiCommon.getFolderList);
  if (resultList.error) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultList.message } });
  }

  if (!resultJson.error) {
    yield put({ type: SET_STATUS, payload: false });
  }
}

function* editFolder(action): Saga<void> {
  yield put({ type: API_EDIT_FOLDER, payload: { isFetching: true } });
  const resultJson = yield call(ApiCommon.postFolderEdit.bind(this, action.payload));
  yield put({ type: API_EDIT_FOLDER, payload: { ...resultJson, isFetching: false } });

  const resultList = yield call(ApiCommon.getFolderList);
  if (resultList.error) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultList.message } });
  }

  if (!resultJson.error) {
    yield put({ type: SET_FORM_DATA });
    yield put({ type: SET_STATUS, payload: false });
  }
}

function* apiInitStatus(): Saga<void> {
  const resultJson = yield call(ApiCommon.getInit, 'status');
  if (resultJson.error) {
    yield dispatchAction(QUEUE_GLOBAL_ALERT, { type: 'error', text: resultJson.message });
  } else {
    yield dispatchAction(FIRSTRUN_STATUS, resultJson.data);
  }
}

function* firstrunGetDatabase(): Saga<void> {
  yield put({ type: Events.START_FETCHING, payload: 'firstrunDatabase' });
  const resultJson = yield call(ApiCommon.getInitDatabase);
  yield put({ type: Events.STOP_FETCHING, payload: 'firstrunDatabase' });
  if (resultJson.error) {
    yield put({ type: FIRSTRUN_DATABASE, payload: { status: { type: 'error', text: resultJson.message } } });
    yield delay(1000);
    yield put({ type: FIRSTRUN_DATABASE, payload: { } });
  } else {
    yield put({ type: FIRSTRUN_DATABASE, payload: resultJson.data });
  }
}

function* firstrunTestDatabase(): Saga<void> {
  yield put({ type: Events.START_FETCHING, payload: 'firstrunDatabase' });
  const resultJson = yield call(ApiCommon.getInitDatabaseTest);
  yield put({ type: Events.STOP_FETCHING, payload: 'firstrunDatabase' });
  if (resultJson.error) {
    yield put({ type: FIRSTRUN_DATABASE, payload: { status: { type: 'error', text: resultJson.message } } });
  } else {
    yield put({ type: FIRSTRUN_DATABASE, payload: { status: { type: 'success', text: 'Database test successful!' } } });
  }
  yield delay(1000);
  yield put({ type: FIRSTRUN_DATABASE, payload: { } });
}

/**
 * 1. Save database settings
 * 2. Test connection
 * 3. Start polling
 * 4. Tell server to init database
 */
function* firstrunInitDatabase(): Saga<void> {
  // 1. Save database settings
  const database = yield select(state => state.firstrun.database);
  yield put({ type: Events.START_FETCHING, payload: 'firstrunInit' });
  let resultJson = yield call(ApiCommon.postInitDatabase.bind(this, database));
  yield put({ type: Events.STOP_FETCHING, payload: 'firstrunInit' });
  if (resultJson.error) {
    yield put({ type: FIRSTRUN_DATABASE, payload: { status: { type: 'error', text: resultJson.message } } });
  } else {
    yield put({ type: FIRSTRUN_DATABASE, payload: { status: { type: 'success', text: 'Database settings saved!' } } });
  }
  yield delay(1000);
  yield put({ type: FIRSTRUN_DATABASE, payload: { } });

  // 2. Test connection
  yield call(firstrunTestDatabase);

  // 3. Start polling
  yield put({ type: Events.START_FETCHING, payload: 'firstrunDatabase' });
  yield put({ type: Events.START_API_POLLING, payload: { type: 'server-status' } });

  // 4. Tell server to init database
  resultJson = yield call(ApiCommon.getInitStartserver);
  if (resultJson.error) {
    yield put({ type: Events.STOP_API_POLLING, payload: { type: 'server-status' } });
    yield put({ type: Events.STOP_FETCHING, payload: 'firstrunDatabase' });
    yield put({ type: FIRSTRUN_DATABASE, payload: { status: { type: 'error', text: resultJson.message } } });
    yield delay(1000);
    yield put({ type: FIRSTRUN_DATABASE, payload: { } });
  }
}

function* startFetching(action): Saga<void> {
  yield put({ type: SET_FETCHING, payload: { [action.payload]: true } });
}

function* stopFetching(action): Saga<void> {
  yield put({ type: SET_FETCHING, payload: { [action.payload]: false } });
}

function* firstrunGetAnidb(): Saga<void> {
  yield put({ type: Events.START_FETCHING, payload: 'firstrunAnidb' });
  const resultJson = yield call(ApiCommon.getInitAnidb);
  yield put({ type: Events.STOP_FETCHING, payload: 'firstrunAnidb' });
  if (resultJson.error) {
    yield put({ type: FIRSTRUN_ANIDB, payload: { status: { type: 'error', text: resultJson.message } } });
    yield delay(1000);
    yield put({ type: FIRSTRUN_ANIDB, payload: { } });
  } else {
    yield put({ type: FIRSTRUN_ANIDB, payload: resultJson.data });
  }
}

function* firstrunSetAnidb(): Saga<void> {
  const data = yield select((state) => {
    const { anidb } = state.firstrun;
    return {
      login: anidb.login,
      password: anidb.password,
    };
  });
  yield put({ type: Events.START_FETCHING, payload: 'firstrunAnidb' });
  const resultJson = yield call(ApiCommon.postInitAnidb, data);
  yield put({ type: Events.STOP_FETCHING, payload: 'firstrunAnidb' });
  if (resultJson.error) {
    yield put({ type: FIRSTRUN_ANIDB, payload: { status: { type: 'error', text: resultJson.message } } });
  } else {
    yield put({ type: FIRSTRUN_ANIDB, payload: { status: { type: 'success', text: 'AniDB settings saved!' } } });
  }
  yield delay(1000);
  yield put({ type: FIRSTRUN_ANIDB, payload: { } });
}

function* firstrunTestAnidb(): Saga<void> {
  // Save first, so we test the actual credential users sees
  const data = yield select((state) => {
    const { anidb } = state.firstrun;
    return {
      login: anidb.login,
      password: anidb.password,
    };
  });
  yield put({ type: Events.START_FETCHING, payload: 'firstrunAnidb' });
  const resultJson = yield call(ApiCommon.postInitAnidb, data);
  if (resultJson.error) {
    yield put({ type: Events.STOP_FETCHING, payload: 'firstrunAnidb' });
    yield put({ type: FIRSTRUN_ANIDB, payload: { status: { type: 'error', text: resultJson.message } } });
    return;
  }

  const resultTestJson = yield call(ApiCommon.getInitAnidbTest);
  yield put({ type: Events.STOP_FETCHING, payload: 'firstrunAnidb' });
  if (resultTestJson.error) {
    yield put({ type: FIRSTRUN_ANIDB, payload: { status: { type: 'error', text: resultJson.message } } });
  } else {
    yield put({ type: FIRSTRUN_ANIDB, payload: { status: { type: 'success', text: 'AniDB credentials are correct!' } } });
  }
  yield delay(1000);
  yield put({ type: FIRSTRUN_ANIDB, payload: { } });
}

function* firstrunGetDefaultuser(): Saga<void> {
  yield put({ type: Events.START_FETCHING, payload: 'firstrunUser' });
  const resultJson = yield call(ApiCommon.getInitDefaultuser);
  yield put({ type: Events.STOP_FETCHING, payload: 'firstrunUser' });
  if (resultJson.error) {
    yield put({ type: FIRSTRUN_USER, payload: { status: { type: 'error', text: resultJson.message } } });
    yield delay(1000);
    yield put({ type: FIRSTRUN_USER, payload: { } });
  } else {
    yield put({ type: FIRSTRUN_USER, payload: resultJson.data });
  }
}

function* firstrunSetDefaultuser(): Saga<void> {
  const data = yield select((state) => {
    const { user } = state.firstrun;
    return {
      login: user.login,
      password: user.password,
    };
  });
  yield put({ type: Events.START_FETCHING, payload: 'firstrunUser' });
  const resultJson = yield call(ApiCommon.postInitDefaultuser, data);
  yield put({ type: Events.STOP_FETCHING, payload: 'firstrunUser' });
  if (resultJson.error) {
    yield put({ type: FIRSTRUN_USER, payload: { status: { type: 'error', text: resultJson.message } } });
  } else {
    yield put({ type: FIRSTRUN_USER, payload: { status: { type: 'success', text: 'User saved!' } } });
  }
  yield delay(1000);
  yield put({ type: FIRSTRUN_USER, payload: { } });
}

function* firstrunGetDatabaseSqlserverinstance(): Saga<void> {
  yield put({ type: Events.START_FETCHING, payload: 'firstrunDatabase' });
  const resultJson = yield call(ApiCommon.getInitDatabaseSqlserverinstance);
  yield put({ type: Events.STOP_FETCHING, payload: 'firstrunDatabase' });
  if (resultJson.error) {
    yield put({ type: FIRSTRUN_DATABASE, payload: { status: { type: 'error', text: resultJson.message } } });
    yield delay(1000);
    yield put({ type: FIRSTRUN_DATABASE, payload: { } });
  } else {
    yield put({ type: FIRSTRUN_DATABASE, payload: { instances: resultJson.data } });
  }
}

function* logout(): Saga<void> {
  yield put({ type: LOGOUT, payload: {} });
  yield put(push({ pathname: '/' }));
}

function* login(action): Saga<void> {
  const { payload } = action;
  yield put({ type: Events.START_FETCHING, payload: 'login' });
  const resultJson = yield call(ApiCommon.postAuth, payload);
  yield put({ type: Events.STOP_FETCHING, payload: 'login' });
  if (resultJson.error) {
    let errorMessage = resultJson.message;
    if (resultJson.status === 417) {
      errorMessage = 'Invalid Username or Password';
    }
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: errorMessage } });
    yield put({ type: Events.LOGOUT, payload: null });
    return;
  }

  yield put(apiSession({ apikey: resultJson.data.apikey, username: payload.user }));

  yield put({ type: Events.START_FETCHING, payload: 'jmmuserid' });
  const useridResultJson = yield call(ApiCommon.getJMMUserID);
  yield put({ type: Events.STOP_FETCHING, payload: 'jmmuserid' });

  yield put(apiSession({ userid: useridResultJson.data.userid }));

  yield put(push({ pathname: '/dashboard' }));
}

function* changePassword(action): Saga<void> {
  const { payload } = action;
  const resultJson = yield call(ApiCommon.postChangePassword, payload.formData);
  if (resultJson.error) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }

  yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'success', text: 'Password changed successfully!' } });

  const loginPayload = {
    user: payload.username,
    pass: payload.formData.password,
    device: 'web-ui',
  };
  yield put({ type: Events.LOGIN, payload: loginPayload });
}

function* checkUpdates(): Saga<void> {
  const { updateChannel } = yield select(state => state.settings.other);
  const resultJson = yield call(ApiCommon.webuiLatest, updateChannel);
  if (resultJson.error) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }

  yield put({ type: UPDATE_AVAILABLE, payload: resultJson.data });
}

function* serverVersion(): Saga<void> {
  yield dispatchAction(Events.START_FETCHING, 'serverVersion');
  const resultJson = yield call(ApiCommon.getVersion);
  yield dispatchAction(Events.STOP_FETCHING, 'serverVersion');
  if (resultJson.error) {
    yield dispatchAction(QUEUE_GLOBAL_ALERT, { type: 'error', text: resultJson.message });
    return;
  }

  let version = null;
  forEach(resultJson.data, (value) => {
    if (value.name === 'server') {
      // eslint-disable-next-line prefer-destructuring
      version = value.version;
    }
  });

  yield dispatchAction(JMM_VERSION, version);
}

function* downloadUpdates(): Saga<void> {
  yield dispatchAction(Events.START_FETCHING, 'downloadUpdates');
  const channel = yield select(state => state.settings.other.updateChannel);
  const resultJson = yield call(ApiCommon.getWebuiUpdate, channel);
  yield dispatchAction(Events.STOP_FETCHING, 'downloadUpdates');
  if (resultJson.error) {
    const message = `Oops! Something went wrong! Submit an issue on GitHub so we can fix it. ${resultJson.message}`;
    yield dispatchAction(QUEUE_GLOBAL_ALERT, { type: 'error', text: message, duration: 10000 });
    return;
  }

  const message = 'Update Successful! Please reload the page for the updated version.';
  yield dispatchAction(QUEUE_GLOBAL_ALERT, { type: 'success', text: message, duration: 10000 });
}

function* fetchImportFolderSeries(action): Saga<void> {
  yield dispatchAction(SELECT_IMPORT_FOLDER_SERIES, action.payload);
  yield dispatchAction(Events.START_FETCHING, 'importFolderSeries');
  const resultJson = yield call(ApiCommon.getSerieInfobyfolder, `?id=${action.payload.id}`);
  yield dispatchAction(Events.STOP_FETCHING, 'importFolderSeries');
  if (resultJson.error) {
    yield dispatchAction(IMPORT_FOLDER_SERIES, {});
    yield dispatchAction(QUEUE_GLOBAL_ALERT, { type: 'error', text: resultJson.message });
    return;
  }
  yield dispatchAction(IMPORT_FOLDER_SERIES, resultJson.data.series);
}

function* osBrowse(action): Saga<void> {
  let genId = yield select(state => state.modals.browseFolder.id);
  const { id, path } = action.payload;
  yield dispatchAction(Events.START_FETCHING, `browse-treenode-${id}`);
  const resultJson = yield call(path === '' ? ApiCommon.getOsDrives : ApiCommon.postOsFolder, path);
  yield dispatchAction(Events.STOP_FETCHING, `browse-treenode-${id}`);
  if (resultJson.error) {
    yield dispatchAction(QUEUE_GLOBAL_ALERT, { type: 'error', text: resultJson.message });
    return;
  }
  const nodes = [];
  forEach(resultJson.data.subdir, (node) => {
    genId += 1;
    nodes.push(Object.assign({}, node, { nodeId: genId }));
  });
  yield put(setBrowseModalId(genId));
  yield put(setBrowseModalItems({ key: id, nodes }));
}

export default function* rootSaga(): Saga<void> {
  yield all([
    takeEvery(QUEUE_GLOBAL_ALERT, queueGlobalAlert),
    takeEvery(SHOW_GLOBAL_ALERT, alertScheduler),
    takeEvery(SETTINGS_API_GET, getSettings),
    takeEvery(Events.DASHBOARD_LOAD, Dashboard.eventDashboardLoad),
    takeEvery(Events.DASHBOARD_QUEUE_STATUS, Dashboard.eventDashboardQueueStatus),
    takeEvery(Events.DASHBOARD_RECENT_FILES, Dashboard.eventDashboardRecentFiles),
    takeEvery(Events.PAGE_IMPORT_FOLDERS_LOAD, Dashboard.updateOverview),
    takeEvery(Events.PAGE_LOGS_LOAD, Dashboard.updateOverview),
    takeEvery(Events.QUEUE_OPERATION, Dashboard.queueOperation),
    takeEvery(Events.PAGE_SETTINGS_LOAD, pageSettingsLoad),
    takeEvery(Events.SETTINGS_EXPORT, settingsExport),
    takeEvery(Events.SETTINGS_IMPORT, settingsImport),
    takeEvery(Events.SETTINGS_POST_LOG_ROTATE, settingsSaveLogRotate),
    takeEvery(Events.RUN_QUICK_ACTION, runQuickAction),
    takeEvery(Events.ADD_FOLDER, addFolder),
    takeEvery(Events.EDIT_FOLDER, editFolder),
    takeEvery(Events.SETTINGS_POST_WEBUI, settings.saveWebui),
    takeEvery(Events.SETTINGS_GET_SERVER, settings.getServer),
    takeEvery(Events.SETTINGS_SAVE_SERVER, settings.saveServer),
    takeEvery(Events.INIT_STATUS, apiInitStatus),
    takeEvery(Events.FIRSTRUN_GET_DATABASE, firstrunGetDatabase),
    takeEvery(Events.FIRSTRUN_INIT_DATABASE, firstrunInitDatabase),
    takeEvery(Events.FIRSTRUN_TEST_DATABASE, firstrunTestDatabase),
    takeEvery(Events.FIRSTRUN_GET_DATABASE_SQL_INSTANCES, firstrunGetDatabaseSqlserverinstance),
    takeEvery(Events.START_FETCHING, startFetching),
    takeEvery(Events.STOP_FETCHING, stopFetching),
    takeEvery(Events.START_API_POLLING, apiPollingDriver),
    takeEvery(Events.FIRSTRUN_GET_ANIDB, firstrunGetAnidb),
    takeEvery(Events.FIRSTRUN_SET_ANIDB, firstrunSetAnidb),
    takeEvery(Events.FIRSTRUN_TEST_ANIDB, firstrunTestAnidb),
    takeEvery(Events.FIRSTRUN_GET_USER, firstrunGetDefaultuser),
    takeEvery(Events.FIRSTRUN_SET_USER, firstrunSetDefaultuser),
    takeEvery(Events.LOGOUT, logout),
    takeEvery(Events.CHECK_UPDATES, checkUpdates),
    takeEvery(Events.SERVER_VERSION, serverVersion),
    takeEvery(Events.WEBUI_UPDATE, downloadUpdates),
    takeEvery(Events.FETCH_IMPORT_FOLDER_SERIES, fetchImportFolderSeries),
    takeEvery(Events.SETTINGS_GET_TRAKT_CODE, settings.getTraktCode),
    takeEvery(Events.SETTINGS_PLEX_LOGIN_URL, settings.getPlexLoginUrl),
    takeEvery(Events.LOGIN, login),
    takeEvery(Events.CHANGE_PASSWORD, changePassword),
    takeEvery(Events.OS_BROWSE, osBrowse),
    takeEvery(Events.SETTINGS_SAVE_QUICK_ACTION, settings.saveQuickAction),
  ]);
}
