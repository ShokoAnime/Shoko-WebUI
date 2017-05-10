import { put, call } from 'redux-saga/effects';
import store from '../store';
import Api from '../api';
import {
  QUEUE_GLOBAL_ALERT,
  QUEUE_STATUS,
  RECENT_FILES,
  IMPORT_FOLDERS,
  SERIES_COUNT,
  FILES_COUNT,
  JMM_NEWS,
  UPDATE_AVAILABLE,
  setAutoupdate,
} from '../actions';

import { SET_THEME, SET_NOTIFICATIONS } from '../actions/settings/UI';
import { SET_LOG_DELTA, SET_UPDATE_CHANNEL } from '../actions/settings/Other';

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

function* getQueueStatus() {
  const resultJson = yield call(Api.queueStatus);
  if (resultJson.error) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }

  yield put({ type: QUEUE_STATUS, payload: resultJson.data });
}

function* getRecentFiles() {
  const resultJson = yield call(Api.fileRecent);
  if (resultJson.error) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }

  yield put({ type: RECENT_FILES, payload: resultJson.data });
}

function* updateOverview() {
  yield call(getQueueStatus);

  let resultJson = yield call(Api.folderList);
  if (resultJson.error) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }

  yield put({ type: IMPORT_FOLDERS, payload: resultJson.data });

  resultJson = yield call(Api.serieCount);
  if (resultJson.error) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }

  yield put({ type: SERIES_COUNT, payload: resultJson.data });

  resultJson = yield call(Api.fileCount);
  if (resultJson.error) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }
  yield put({ type: FILES_COUNT, payload: resultJson.data });
}

function* eventDashboardQueueStatus() {
  yield call(getQueueStatus);
}

function* eventDashboardRecentFiles() {
  yield call(getRecentFiles);
}

function* eventDashboardLoad() {
  yield call(getQueueStatus);
  yield call(getRecentFiles);

  let resultJson = yield call(Api.folderList);
  if (resultJson.error) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }

  yield put({ type: IMPORT_FOLDERS, payload: resultJson.data });

  yield call(getSettings);

  resultJson = yield call(Api.serieCount);
  if (resultJson.error) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }

  yield put({ type: SERIES_COUNT, payload: resultJson.data });

  resultJson = yield call(Api.fileCount);
  if (resultJson.error) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }

  yield put({ type: FILES_COUNT, payload: resultJson.data });

  resultJson = yield call(Api.newsGet);
  if (resultJson.error) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }

  yield put({ type: JMM_NEWS, payload: resultJson.data });

  const state = store.getState();
  const updateChannel = state.settings.other.updateChannel;

  resultJson = yield call(Api.webuiLatest, updateChannel);
  if (resultJson.error) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }

  yield put({ type: UPDATE_AVAILABLE, payload: resultJson.data });
  yield put(setAutoupdate(true));
}

export default {
  eventDashboardLoad,
  eventDashboardQueueStatus,
  eventDashboardRecentFiles,
  updateOverview,
};
