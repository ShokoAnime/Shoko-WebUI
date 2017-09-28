import { delay } from 'redux-saga';
import { put, takeEvery, call, select } from 'redux-saga/effects';
import { without } from 'lodash/array';
import { forEach } from 'lodash';
import * as Ajv from 'ajv';
import Api from '../api';
import Events from '../events';
import Dashboard from './dashboard';
import {
  QUEUE_GLOBAL_ALERT,
  SHOW_GLOBAL_ALERT,
  GLOBAL_ALERT,
} from '../actions';
import { GET_DELTA } from '../actions/logs/Delta';
import { SET_CONTENTS, APPEND_CONTENTS } from '../actions/logs/Contents';
import { SETTINGS_API_GET } from '../actions/settings/Api';
import { SET_THEME, SET_NOTIFICATIONS } from '../actions/settings/UI';
import { SET_LOG_DELTA, SET_UPDATE_CHANNEL } from '../actions/settings/Other';
import { GET_LOG } from '../actions/settings/Log';
import { SETTINGS_JSON } from '../actions/settings/Json';
import {
  API_ADD_FOLDER, API_EDIT_FOLDER, SET_FORM_DATA,
  SET_STATUS,
} from '../actions/modals/ImportFolder';
import queueGlobalAlert from './QueueGlobalAlert';

// TODO: separate into submodules, for now we just put all sagas in one file

/* ALERT SYSTEM */
const maxAlerts = 2;
const alertDisplayTime = 3000;
let activeAlerts = [];

function* alertScheduler(action) {
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

function* getLogDelta(action) {
  const resultJson = yield call(Api.getLogDelta, action.payload);

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

function* getSettings() {
  const resultJson = yield call(Api.getWebuiConfig);

  if (resultJson.error) {
    if (resultJson.code === 404) { return; }
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }
  const data = resultJson.data;

  yield put({ type: SET_THEME, payload: data.uiTheme });
  yield put({ type: SET_NOTIFICATIONS, payload: data.uiNotifications });
  yield put({ type: SET_LOG_DELTA, payload: data.otherLogDelta });
  yield put({ type: SET_UPDATE_CHANNEL, payload: data.otherUpdateChannel });
}

function* settingsExport() {
  const resultJson = yield call(Api.configExport);

  if (resultJson.error) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }
  const data = JSON.stringify(resultJson.data);

  yield put({ type: SETTINGS_JSON, payload: data });
}

function* settingsImport(action) {
  const resultJson = yield call(Api.configImport.bind(this, action.payload));

  if (resultJson.error) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
  }
}

function* pageSettingsLoad() {
  yield call(Dashboard.updateOverview);

  const resultJson = yield call(Api.getLogRotate);
  if (resultJson.error) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }
  const data = resultJson.data;

  yield put({ type: GET_LOG, payload: data });
}

function* settingsSaveLogRotate(action) {
  const resultJson = yield call(Api.postLogRotate.bind(this, action.payload));
  if (resultJson.error) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
  } else {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: 'Log settings saved!' } });
  }
}

function* runQuickAction(action) {
  let actionFunc;
  switch (action.payload) {
    case 'import':
      actionFunc = Api.getFolderImport;
      break;
    case 'remove_missing_files':
      actionFunc = Api.getRemoveMissingFiles;
      break;
    case 'stats_update':
      actionFunc = Api.getStatsUpdate;
      break;
    case 'mediainfo_update':
      actionFunc = Api.getMediainfoUpdate;
      break;
    case 'plex_sync':
      actionFunc = Api.getPlexSync;
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

function* addFolder(action) {
  yield put({ type: API_ADD_FOLDER, payload: { isFetching: true } });
  const resultJson = yield call(Api.postFolderAdd.bind(this, action.payload));
  yield put({ type: API_ADD_FOLDER, payload: { ...resultJson, isFetching: false } });

  const resultList = yield call(Api.getFolderList);
  if (resultList.error) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultList.message } });
  }

  if (!resultJson.error) {
    yield put({ type: SET_STATUS, payload: false });
  }
}

function* editFolder(action) {
  yield put({ type: API_EDIT_FOLDER, payload: { isFetching: true } });
  const resultJson = yield call(Api.postFolderEdit.bind(this, action.payload));
  yield put({ type: API_EDIT_FOLDER, payload: { ...resultJson, isFetching: false } });

  const resultList = yield call(Api.getFolderList);
  if (resultList.error) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultList.message } });
  }

  if (!resultJson.error) {
    yield put({ type: SET_FORM_DATA });
    yield put({ type: SET_STATUS, payload: false });
  }
}

function* settingsSaveWebui(action) {
  const settings = yield select(state => state.settings);
  const currentSettings = {
    uiTheme: settings.ui.theme,
    uiNotifications: settings.ui.notifications,
    otherUpdateChannel: settings.other.updateChannel,
    logDelta: settings.other.logDelta,
  };
  const data = { ...currentSettings, ...action.payload };

  const schema = {
    required: ['uiTheme', 'uiNotifications', 'otherUpdateChannel', 'logDelta'],
    uiTheme: { enum: ['light', 'dark', 'custom'] },
    uiNotifications: { type: 'boolean' },
    otherUpdateChannel: { enum: ['stable', 'unstable'] },
    logDelta: { type: 'integer', minimum: 1, maximum: 1000 },
  };

  const ajv = new Ajv();
  const validator = ajv.compile(schema);
  const result = validator(data);
  if (result !== true) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: `Schema validation failed! ${result.toString()}` } });
    return;
  }

  const resultJson = yield call(Api.postWebuiConfig.bind(this, data));
  if (resultJson.error) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
  } else {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'success', text: 'WebUI settings saved!' } });
  }
}

export default function* rootSaga() {
  yield [
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
    takeEvery(Events.SETTINGS_POST_WEBUI, settingsSaveWebui),
  ];
}
