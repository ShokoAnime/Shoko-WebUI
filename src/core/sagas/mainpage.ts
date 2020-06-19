import { all, put, call } from 'redux-saga/effects';
import { forEach } from 'lodash';

import Events from '../events';
import ApiCommon from '../api/common';

import { SET_LOG_DELTA, SET_UPDATE_CHANNEL } from '../actions/settings/Other';
import { SET_THEME, SET_NOTIFICATIONS } from '../actions/settings/UI';
import { settingsQuickActions } from '../actions/settings/QuickActions';

import { setFetched, setQueueStatus } from '../slices/mainpage';

import SagaDashboard from './dashboard';
import SagaFile from './file';
import SagaImportFolder from './import-folder';

function* getQueueStatus() {
  const resultJson = yield call(ApiCommon.getQueue);
  if (resultJson.error) {
    yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }

  yield put(setQueueStatus(resultJson.data));
  yield put(setFetched('queueStatus'));
}

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
  if (data.quickActions) {
    let slot = 0;
    yield all(forEach(data.quickActions, (item) => {
      slot += 1;
      return put(settingsQuickActions({ slot, id: item }));
    }));
  }
}

// Events

function* eventMainPageLoad() {
  yield call(getQueueStatus);
  yield call(getSettings);
  yield call(SagaDashboard.getDashboardStats);
  yield call(SagaDashboard.getDashboardSeriesSummary);
  yield call(SagaImportFolder.getImportFolders);
  yield call(SagaFile.getRecentFiles);
  yield call(SagaImportFolder.getImportFolderSeries, { payload: 1 });

  yield put({ type: Events.CHECK_UPDATES });
  // yield put({ type: Events.START_API_POLLING, payload: { type: 'auto-refresh' } });
}

function* eventQueueOperation(action) {
  const { payload } = action;
  const funcName = `getQueue${payload}`;

  if (typeof ApiCommon[funcName] !== 'function') {
    yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: 'Unknown action!' } });
    return;
  }

  const resultJson = yield call(ApiCommon[funcName]);
  if (resultJson.error) {
    yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
  } else {
    yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'success', text: 'Request sent!' } });
  }
}

export default {
  getQueueStatus,
  getSettings,
  eventMainPageLoad,
  eventQueueOperation,
};
