// @flow
import type { Saga } from 'redux-saga';
import { all, put, call } from 'redux-saga/effects';
import { forEach } from 'lodash';
import Api from '../api/common';
import {
  QUEUE_GLOBAL_ALERT,
  QUEUE_STATUS,
  RECENT_FILES,
  IMPORT_FOLDERS,
  SERIES_COUNT,
  FILES_COUNT,
  JMM_NEWS,
} from '../actions';
import { SET_THEME, SET_NOTIFICATIONS } from '../actions/settings/UI';
import { SET_LOG_DELTA, SET_UPDATE_CHANNEL } from '../actions/settings/Other';
import Events from '../events';
import { settingsQuickActions } from '../actions/settings/QuickActions';

function* getSettings(): Saga<void> {
  const resultJson = yield call(Api.getWebuiConfig);

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
  if (data.quickActions) {
    let slot = 0;
    yield all(forEach(data.quickActions, (item) => {
      slot += 1;
      return put(settingsQuickActions({ slot, id: item }));
    }));
  }
}

function* getQueueStatus(): Saga<void> {
  const resultJson = yield call(Api.queueStatus);
  if (resultJson.error) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }

  yield put({ type: QUEUE_STATUS, payload: resultJson.data });
}

function* getRecentFiles(): Saga<void> {
  const resultJson = yield call(Api.fileRecent);
  if (resultJson.error) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }

  yield put({ type: RECENT_FILES, payload: resultJson.data });
}

function* updateOverview(): Saga<void> {
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

function* eventDashboardQueueStatus(): Saga<void> {
  yield call(getQueueStatus);
}

function* eventDashboardRecentFiles(): Saga<void> {
  yield call(getRecentFiles);
}

function* eventDashboardLoad(): Saga<void> {
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

  /* resultJson = yield call(Api.newsGet);
  if (resultJson.error) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
  } else {
    yield put({ type: JMM_NEWS, payload: resultJson.data });
  } */


  yield put({ type: Events.CHECK_UPDATES });
  // yield put({ type: Events.START_API_POLLING, payload: { type: 'auto-refresh' } });
}

export default {
  eventDashboardLoad,
  eventDashboardQueueStatus,
  eventDashboardRecentFiles,
  updateOverview,
};
