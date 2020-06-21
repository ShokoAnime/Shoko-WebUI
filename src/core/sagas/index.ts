import {
  all, call, put, select, takeEvery, delay,
} from 'redux-saga/effects';
import {
  capitalize, forEach, map,
} from 'lodash';
import { createAction } from 'redux-actions';
import ApiCommon from '../api/common';
import ApiActions from '../api/actions';

import Events from '../events';

import SagaAlerts from './alerts';
import SagaAuth from './auth';
import SagaFile from './file';
import SagaImportFolder from './import-folder';
import SagaMainPage from './mainpage';

import {
  JMM_VERSION, UPDATE_AVAILABLE,
} from '../actions';
import { SETTINGS_API_GET } from '../actions/settings/Api';
import { SET_NOTIFICATIONS, SET_THEME } from '../actions/settings/UI';
import { SET_LOG_DELTA, SET_UPDATE_CHANNEL } from '../actions/settings/Other';
import { GET_LOG } from '../actions/settings/Log';
import { SETTINGS_JSON } from '../actions/settings/Json';
import {
  FIRSTRUN_ANIDB, FIRSTRUN_DATABASE, FIRSTRUN_STATUS, FIRSTRUN_USER,
} from '../actions/firstrun';
import {
  API_ADD_FOLDER, API_EDIT_FOLDER, SET_FORM_DATA,
} from '../actions/settings/ImportFolder';
import {
  setItems as setBrowseModalItems, setId as setBrowseModalId,
} from '../actions/modals/BrowseFolder';
import apiPollingDriver from './apiPollingDriver';
import settings from './settings';

import { startFetching, stopFetching } from '../slices/fetching';

const dispatchAction = (type, payload) => put(createAction(type)(payload));

// TODO: separate into submodules, for now we just put all sagas in one file

/* ALERT SYSTEM */

function* getSettings() {
  const resultJson = yield call(ApiCommon.getWebuiConfig);

  if (resultJson.error) {
    if (resultJson.code === 404) { return; }
    yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }
  const {
    data,
  } = resultJson;

  yield put({ type: SET_THEME, payload: data.uiTheme });
  yield put({ type: SET_NOTIFICATIONS, payload: data.uiNotifications });
  yield put({ type: SET_LOG_DELTA, payload: data.otherLogDelta });
  yield put({ type: SET_UPDATE_CHANNEL, payload: data.otherUpdateChannel });
}

function* settingsExport() {
  const resultJson = yield call(ApiCommon.configExport);

  if (resultJson.error) {
    yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }
  const data = JSON.stringify(resultJson.data);

  yield put({ type: SETTINGS_JSON, payload: data });
}

function* settingsImport(action) {
  const resultJson = yield call(ApiCommon.configImport.bind(this, action.payload));

  if (resultJson.error) {
    yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
  }
}

function* pageSettingsLoad() {
  yield call(SagaMainPage.getSettings);

  const resultJson = yield call(ApiCommon.getLogRotate);
  if (resultJson.error) {
    yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }
  const {
    data,
  } = resultJson;

  yield put({ type: GET_LOG, payload: data });
}

function* settingsSaveLogRotate(action) {
  const resultJson = yield call(ApiCommon.postLogRotate.bind(this, action.payload));
  if (resultJson.error) {
    yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
  } else {
    yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'success', text: 'Log settings saved!' } });
  }
}

function* runQuickAction(action) {
  const {
    payload,
  } = action;
  const capitalizedName = map(payload.split('-'), word => capitalize(word)).join('');
  const funcName = `get${capitalizedName}`;

  if (typeof ApiActions[funcName] !== 'function') {
    yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: 'Unknown action!' } });
    return;
  }

  const resultJson = yield call(ApiActions[funcName]);
  if (resultJson.error) {
    yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
  } else {
    yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'success', text: 'Request sent!' } });
  }
}

function* addFolder(action) {
  yield put({ type: API_ADD_FOLDER, payload: { isFetching: true } });
  const resultJson = yield call(ApiCommon.postFolderAdd.bind(this, action.payload));
  yield put({ type: API_ADD_FOLDER, payload: { ...resultJson, isFetching: false } });

  const resultList = yield call(ApiCommon.getFolderList);
  if (resultList.error) {
    yield put({
      type: Events.QUEUE_GLOBAL_ALERT,
      payload: { type: 'error', text: resultList.message },
    });
  }
}

function* editFolder(action) {
  yield put({ type: API_EDIT_FOLDER, payload: { isFetching: true } });
  const resultJson = yield call(ApiCommon.postFolderEdit.bind(this, action.payload));
  yield put({ type: API_EDIT_FOLDER, payload: { ...resultJson, isFetching: false } });

  const resultList = yield call(ApiCommon.getFolderList);
  if (resultList.error) {
    yield put({
      type: Events.QUEUE_GLOBAL_ALERT,
      payload: { type: 'error', text: resultList.message },
    });
  }

  if (!resultJson.error) {
    yield put({ type: SET_FORM_DATA });
  }
}

function* apiInitStatus() {
  const resultJson = yield call(ApiCommon.getInit, 'status');
  if (resultJson.error) {
    yield dispatchAction(Events.QUEUE_GLOBAL_ALERT, { type: 'error', text: resultJson.message });
  } else {
    yield dispatchAction(FIRSTRUN_STATUS, resultJson.data);
  }
}

function* firstrunGetDatabase() {
  yield put(startFetching('firstrunDatabase'));
  const resultJson = yield call(ApiCommon.getInitDatabase);
  yield put(stopFetching('firstrunDatabase'));
  if (resultJson.error) {
    yield put({ type: FIRSTRUN_DATABASE, payload: { status: { type: 'error', text: resultJson.message } } });
    yield delay(1000);
    yield put({ type: FIRSTRUN_DATABASE, payload: {} });
  } else {
    yield put({ type: FIRSTRUN_DATABASE, payload: resultJson.data });
  }
}

function* firstrunTestDatabase() {
  yield put(startFetching('firstrunDatabase'));
  const resultJson = yield call(ApiCommon.getInitDatabaseTest);
  yield put(stopFetching('firstrunDatabase'));
  if (resultJson.error) {
    yield put({ type: FIRSTRUN_DATABASE, payload: { status: { type: 'error', text: resultJson.message } } });
  } else {
    yield put({ type: FIRSTRUN_DATABASE, payload: { status: { type: 'success', text: 'Database test successful!' } } });
  }
  yield delay(1000);
  yield put({ type: FIRSTRUN_DATABASE, payload: {} });
}

/**
 * 1. Save database settings
 * 2. Test connection
 * 3. Start polling
 * 4. Tell server to init database
 */
function* firstrunInitDatabase() {
  // 1. Save database settings
  const database = yield select(state => state.firstrun.database);
  yield put(startFetching('firstrunInit'));
  let resultJson = yield call(ApiCommon.postInitDatabase.bind(this, database));
  yield put(stopFetching('firstrunInit'));
  if (resultJson.error) {
    yield put({ type: FIRSTRUN_DATABASE, payload: { status: { type: 'error', text: resultJson.message } } });
  } else {
    yield put({ type: FIRSTRUN_DATABASE, payload: { status: { type: 'success', text: 'Database settings saved!' } } });
  }
  yield delay(1000);
  yield put({ type: FIRSTRUN_DATABASE, payload: {} });

  // 2. Test connection
  yield call(firstrunTestDatabase);

  // 3. Start polling
  yield put(startFetching('firstrunDatabase'));
  yield put({ type: Events.START_API_POLLING, payload: { type: 'server-status' } });

  // 4. Tell server to init database
  resultJson = yield call(ApiCommon.getInitStartserver);
  if (resultJson.error) {
    yield put({ type: Events.STOP_API_POLLING, payload: { type: 'server-status' } });
    yield put(stopFetching('firstrunDatabase'));
    yield put({ type: FIRSTRUN_DATABASE, payload: { status: { type: 'error', text: resultJson.message } } });
    yield delay(1000);
    yield put({ type: FIRSTRUN_DATABASE, payload: {} });
  }
}

function* firstrunGetAnidb() {
  yield put(startFetching('firstrunAnidb'));
  const resultJson = yield call(ApiCommon.getInitAnidb);
  yield put(stopFetching('firstrunAnidb'));
  if (resultJson.error) {
    yield put({ type: FIRSTRUN_ANIDB, payload: { status: { type: 'error', text: resultJson.message } } });
    yield delay(1000);
    yield put({ type: FIRSTRUN_ANIDB, payload: {} });
  } else {
    yield put({ type: FIRSTRUN_ANIDB, payload: resultJson.data });
  }
}

function* firstrunSetAnidb() {
  const data = yield select((state) => {
    const {
      anidb,
    } = state.firstrun;
    return {
      login: anidb.login,
      password: anidb.password,
    };
  });
  yield put(startFetching('firstrunAnidb'));
  const resultJson = yield call(ApiCommon.postInitAnidb, data);
  yield put(stopFetching('firstrunAnidb'));
  if (resultJson.error) {
    yield put({ type: FIRSTRUN_ANIDB, payload: { status: { type: 'error', text: resultJson.message } } });
  } else {
    yield put({ type: FIRSTRUN_ANIDB, payload: { status: { type: 'success', text: 'AniDB settings saved!' } } });
  }
  yield delay(1000);
  yield put({ type: FIRSTRUN_ANIDB, payload: {} });
}

function* firstrunTestAnidb() {
  // Save first, so we test the actual credential users sees
  const data = yield select((state) => {
    const {
      anidb,
    } = state.firstrun;
    return {
      login: anidb.login,
      password: anidb.password,
    };
  });
  yield put(startFetching('firstrunAnidb'));
  const resultJson = yield call(ApiCommon.postInitAnidb, data);
  if (resultJson.error) {
    yield put(stopFetching('firstrunAnidb'));
    yield put({ type: FIRSTRUN_ANIDB, payload: { status: { type: 'error', text: resultJson.message } } });
    return;
  }

  const resultTestJson = yield call(ApiCommon.getInitAnidbTest);
  yield put(stopFetching('firstrunAnidb'));
  if (resultTestJson.error) {
    yield put({ type: FIRSTRUN_ANIDB, payload: { status: { type: 'error', text: resultJson.message } } });
  } else {
    yield put({ type: FIRSTRUN_ANIDB, payload: { status: { type: 'success', text: 'AniDB credentials are correct!' } } });
  }
  yield delay(1000);
  yield put({ type: FIRSTRUN_ANIDB, payload: {} });
}

function* firstrunGetDefaultuser() {
  yield put(startFetching('firstrunUser'));
  const resultJson = yield call(ApiCommon.getInitDefaultuser);
  yield put(stopFetching('firstrunUser'));
  if (resultJson.error) {
    yield put({ type: FIRSTRUN_USER, payload: { status: { type: 'error', text: resultJson.message } } });
    yield delay(1000);
    yield put({ type: FIRSTRUN_USER, payload: {} });
  } else {
    yield put({ type: FIRSTRUN_USER, payload: resultJson.data });
  }
}

function* firstrunSetDefaultuser() {
  const data = yield select((state) => {
    const {
      user,
    } = state.firstrun;
    return {
      login: user.login,
      password: user.password,
    };
  });
  yield put(startFetching('firstrunUser'));
  const resultJson = yield call(ApiCommon.postInitDefaultuser, data);
  yield put(stopFetching('firstrunUser'));
  if (resultJson.error) {
    yield put({ type: FIRSTRUN_USER, payload: { status: { type: 'error', text: resultJson.message } } });
  } else {
    yield put({ type: FIRSTRUN_USER, payload: { status: { type: 'success', text: 'User saved!' } } });
  }
  yield delay(1000);
  yield put({ type: FIRSTRUN_USER, payload: {} });
}

function* firstrunGetDatabaseSqlserverinstance() {
  yield put(startFetching('firstrunDatabase'));
  const resultJson = yield call(ApiCommon.getInitDatabaseSqlserverinstance);
  yield put(stopFetching('firstrunDatabase'));
  if (resultJson.error) {
    yield put({ type: FIRSTRUN_DATABASE, payload: { status: { type: 'error', text: resultJson.message } } });
    yield delay(1000);
    yield put({ type: FIRSTRUN_DATABASE, payload: {} });
  } else {
    yield put({ type: FIRSTRUN_DATABASE, payload: { instances: resultJson.data } });
  }
}

function* checkUpdates() {
  const {
    updateChannel,
  } = yield select(state => state.settings.other);
  const resultJson = yield call(ApiCommon.webuiLatest, updateChannel);
  if (resultJson.error) {
    yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }

  yield put({ type: UPDATE_AVAILABLE, payload: resultJson.data });
}

function* serverVersion() {
  yield put(startFetching('serverVersion'));
  const resultJson = yield call(ApiCommon.getVersion);
  yield put(stopFetching('serverVersion'));
  if (resultJson.error) {
    yield dispatchAction(Events.QUEUE_GLOBAL_ALERT, { type: 'error', text: resultJson.message });
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

function* downloadUpdates() {
  yield put(startFetching('downloadUpdates'));
  const channel = yield select(state => state.settings.other.updateChannel);
  const resultJson = yield call(ApiCommon.getWebuiUpdate, channel);
  yield put(stopFetching('downloadUpdates'));
  if (resultJson.error) {
    const message = `Oops! Something went wrong! Submit an issue on GitHub so we can fix it. ${resultJson.message}`;
    yield dispatchAction(Events.QUEUE_GLOBAL_ALERT, { type: 'error', text: message, duration: 10000 });
    return;
  }

  const message = 'Update Successful! Please reload the page for the updated version.';
  yield dispatchAction(Events.QUEUE_GLOBAL_ALERT, { type: 'success', text: message, duration: 10000 });
}

function* osBrowse(action) {
  let genId = yield select(state => state.modals.browseFolder.id);
  const {
    id,
    path,
  } = action.payload;
  yield put(startFetching(`browse-treenode-${id}`));
  const resultJson = yield call(path === '' ? ApiCommon.getOsDrives : ApiCommon.postOsFolder,
    path);
  yield put(stopFetching(`browse-treenode-${id}`));
  if (resultJson.error) {
    yield dispatchAction(Events.QUEUE_GLOBAL_ALERT, { type: 'error', text: resultJson.message });
    return;
  }
  const nodes: Array<any> = [];
  forEach(resultJson.data.subdir, (node) => {
    genId += 1;
    nodes.push(Object.assign({}, node, { nodeId: genId }));
  });
  yield put(setBrowseModalId(genId));
  yield put(setBrowseModalItems({ key: id, nodes }));
}

export default function* rootSaga() {
  yield all([
    takeEvery(Events.QUEUE_GLOBAL_ALERT, SagaAlerts.queueGlobalAlert),
    takeEvery(SETTINGS_API_GET, getSettings),
    takeEvery(Events.MAINPAGE_FILE_AVDUMP, SagaFile.runAvdump),
    takeEvery(Events.MAINPAGE_IMPORT_FOLDER_SERIES, SagaImportFolder.getImportFolderSeries),
    takeEvery(Events.MAINPAGE_LOAD, SagaMainPage.eventMainPageLoad),
    takeEvery(Events.MAINPAGE_QUEUE_OPERATION, SagaMainPage.eventQueueOperation),
    takeEvery(Events.MAINPAGE_QUEUE_STATUS, SagaMainPage.getQueueStatus),
    takeEvery(Events.MAINPAGE_RECENT_FILES, SagaFile.getRecentFiles),
    takeEvery(Events.MAINPAGE_RECENT_FILE_DETAILS, SagaFile.getRecentFileDetails),
    takeEvery(Events.PAGE_LOGS_LOAD, SagaMainPage.getSettings),
    takeEvery(Events.PAGE_SETTINGS_LOAD, pageSettingsLoad),
    takeEvery(Events.SETTINGS_EXPORT, settingsExport),
    takeEvery(Events.SETTINGS_IMPORT, settingsImport),
    takeEvery(Events.SETTINGS_POST_LOG_ROTATE, settingsSaveLogRotate),
    takeEvery(Events.RUN_QUICK_ACTION, runQuickAction),
    takeEvery(Events.IMPORT_FOLDER_RESCAN, SagaImportFolder.runImportFolderRescan),
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
    takeEvery(Events.START_API_POLLING, apiPollingDriver),
    takeEvery(Events.FIRSTRUN_GET_ANIDB, firstrunGetAnidb),
    takeEvery(Events.FIRSTRUN_SET_ANIDB, firstrunSetAnidb),
    takeEvery(Events.FIRSTRUN_TEST_ANIDB, firstrunTestAnidb),
    takeEvery(Events.FIRSTRUN_GET_USER, firstrunGetDefaultuser),
    takeEvery(Events.FIRSTRUN_SET_USER, firstrunSetDefaultuser),
    takeEvery(Events.LOGOUT, SagaAuth.logout),
    takeEvery(Events.CHECK_UPDATES, checkUpdates),
    takeEvery(Events.SERVER_VERSION, serverVersion),
    takeEvery(Events.WEBUI_UPDATE, downloadUpdates),
    takeEvery(Events.SETTINGS_GET_TRAKT_CODE, settings.getTraktCode),
    takeEvery(Events.SETTINGS_PLEX_LOGIN_URL, settings.getPlexLoginUrl),
    takeEvery(Events.LOGIN, SagaAuth.login),
    takeEvery(Events.SKIP_LOGIN, SagaAuth.skipLogin),
    takeEvery(Events.CHANGE_PASSWORD, SagaAuth.changePassword),
    takeEvery(Events.OS_BROWSE, osBrowse),
    takeEvery(Events.SETTINGS_SAVE_QUICK_ACTION, settings.saveQuickAction),
  ]);
}
