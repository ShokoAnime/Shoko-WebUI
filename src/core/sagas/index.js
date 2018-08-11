// @flow
import type { Saga } from 'redux-saga';
import { delay } from 'redux-saga';
import {
  all, call, put, select, takeEvery,
} from 'redux-saga/effects';
import { without } from 'lodash/array';
import { forEach } from 'lodash';
import { push } from 'connected-react-router';
import { createAction } from 'redux-actions';
import ApiCommon from '../api/common';
import Events from '../events';
import Dashboard from './dashboard';
import {
  GLOBAL_ALERT,
  IMPORT_FOLDER_SERIES,
  JMM_VERSION,
  LOGOUT,
  QUEUE_GLOBAL_ALERT,
  SELECT_IMPORT_FOLDER_SERIES,
  SET_FETCHING,
  SHOW_GLOBAL_ALERT,
  UPDATE_AVAILABLE,
  WEBUI_VERSION_UPDATE,
} from '../actions';
import { GET_DELTA } from '../actions/logs/Delta';
import { APPEND_CONTENTS, SET_CONTENTS } from '../actions/logs/Contents';
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
    yield call(delay, alertDisplayTime);
    activeAlerts = without(activeAlerts, alert);
    yield put({ type: GLOBAL_ALERT, payload: activeAlerts });
  } else {
    yield call(delay, alertDisplayTime / 2);
    yield put({ type: SHOW_GLOBAL_ALERT, payload: alert });
  }
}

/* ALERT SYSTEM */

/**
 * Fetches more log lines from server
 */
function splitLogLines(json) {
  const lines = [];
  let currentLine = null;
  const logRegex = /^\[([0-9-]+\s{1}[0-9:]+)]\s(\w+)\|(.*)/g;

  try {
    forEach(json.lines, (line) => {
      logRegex.lastIndex = 0;
      const tags = logRegex.exec(line);
      if (tags !== null) {
        if (currentLine !== null) {
          lines.push(currentLine);
        }
        currentLine = Object.assign({}, {
          stamp: tags[1],
          tag: tags[2],
          text: tags[3],
        });
      } else {
        if (currentLine === null) {
          currentLine = Object.assign({}, {
            stamp: null,
            tag: null,
            text: tags !== null ? line : '',
          });
        }
        currentLine.text += line;
      }
    });
    if (currentLine !== null) {
      lines.push(currentLine);
    }

    return { data: lines };
  } catch (ex) {
    return { error: true, message: ex.message };
  }
}

function* getLogDelta(action): Saga<void> {
  const resultJson = yield call(ApiCommon.getLogDelta, action.payload);

  if (resultJson.error) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }

  const result = splitLogLines(resultJson.data);
  if (result.error) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: result.message } });
    return;
  }

  yield put({
    type: action.payload ? APPEND_CONTENTS : SET_CONTENTS,
    payload: { lines: result.data, position: resultJson.data.position },
  });
}

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
  let actionFunc;
  switch (action.payload) {
    case 'import':
      actionFunc = ApiCommon.getFolderImport;
      break;
    case 'remove_missing_files':
      actionFunc = ApiCommon.getRemoveMissingFiles;
      break;
    case 'stats_update':
      actionFunc = ApiCommon.getStatsUpdate;
      break;
    case 'mediainfo_update':
      actionFunc = ApiCommon.getMediainfoUpdate;
      break;
    case 'plex_sync':
      actionFunc = ApiCommon.getPlexSync;
      break;
    default:
      yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: 'Unknown action!' } });
      return;
  }

  const resultJson = yield call(actionFunc);
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
    yield call(delay, 1000);
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
  yield call(delay, 1000);
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
  yield call(delay, 1000);
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
    yield call(delay, 1000);
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
    yield call(delay, 1000);
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
  yield call(delay, 1000);
  yield put({ type: FIRSTRUN_ANIDB, payload: { } });
}

function* firstrunTestAnidb(): Saga<void> {
  yield put({ type: Events.START_FETCHING, payload: 'firstrunAnidb' });
  const resultJson = yield call(ApiCommon.getInitAnidbTest);
  yield put({ type: Events.STOP_FETCHING, payload: 'firstrunAnidb' });
  if (resultJson.error) {
    yield put({ type: FIRSTRUN_ANIDB, payload: { status: { type: 'error', text: resultJson.message } } });
  } else {
    yield put({ type: FIRSTRUN_ANIDB, payload: { status: { type: 'success', text: 'AniDB credentials are correct!' } } });
  }
  yield call(delay, 1000);
  yield put({ type: FIRSTRUN_ANIDB, payload: { } });
}

function* firstrunGetDefaultuser(): Saga<void> {
  yield put({ type: Events.START_FETCHING, payload: 'firstrunUser' });
  const resultJson = yield call(ApiCommon.getInitDefaultuser);
  yield put({ type: Events.STOP_FETCHING, payload: 'firstrunUser' });
  if (resultJson.error) {
    yield put({ type: FIRSTRUN_USER, payload: { status: { type: 'error', text: resultJson.message } } });
    yield call(delay, 1000);
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
  yield call(delay, 1000);
  yield put({ type: FIRSTRUN_USER, payload: { } });
}

function* firstrunGetDatabaseSqlserverinstance(): Saga<void> {
  yield put({ type: Events.START_FETCHING, payload: 'firstrunDatabase' });
  const resultJson = yield call(ApiCommon.getInitDatabaseSqlserverinstance);
  yield put({ type: Events.STOP_FETCHING, payload: 'firstrunDatabase' });
  if (resultJson.error) {
    yield put({ type: FIRSTRUN_DATABASE, payload: { status: { type: 'error', text: resultJson.message } } });
    yield call(delay, 1000);
    yield put({ type: FIRSTRUN_DATABASE, payload: { } });
  } else {
    yield put({ type: FIRSTRUN_DATABASE, payload: { instances: resultJson.data } });
  }
}

function* logout(): Saga<void> {
  yield put({ type: LOGOUT, payload: {} });
  yield put(push({ pathname: '/' }));
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
    yield dispatchAction(WEBUI_VERSION_UPDATE, { error: resultJson.message });
    return;
  }

  yield dispatchAction(WEBUI_VERSION_UPDATE, { status: true });
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

export default function* rootSaga(): Saga<void> {
  yield all([
    takeEvery(QUEUE_GLOBAL_ALERT, queueGlobalAlert),
    takeEvery(SHOW_GLOBAL_ALERT, alertScheduler),
    takeEvery(GET_DELTA, getLogDelta),
    takeEvery(SETTINGS_API_GET, getSettings),
    takeEvery(Events.DASHBOARD_LOAD, Dashboard.eventDashboardLoad),
    takeEvery(Events.DASHBOARD_QUEUE_STATUS, Dashboard.eventDashboardQueueStatus),
    takeEvery(Events.DASHBOARD_RECENT_FILES, Dashboard.eventDashboardRecentFiles),
    takeEvery(Events.PAGE_IMPORT_FOLDERS_LOAD, Dashboard.updateOverview),
    takeEvery(Events.PAGE_LOGS_LOAD, Dashboard.updateOverview),
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
  ]);
}
