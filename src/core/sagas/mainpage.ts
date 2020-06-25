import { put, call } from 'redux-saga/effects';

import Events from '../events';
import ApiCommon from '../api/common';
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

// Events

function* eventMainPageLoad() {
  yield call(getQueueStatus);
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
  eventMainPageLoad,
  eventQueueOperation,
};
