import { put, call, all } from 'redux-saga/effects';
import { toast } from 'react-toastify';

import ApiCommon from '../api/common';
import { setFetched, setQueueStatus } from '../slices/mainpage';

import SagaDashboard from './dashboard';
import SagaFile from './file';
import SagaImportFolder from './import-folder';

// const alert = useAlert();

function* getQueueStatus() {
  const resultJson = yield call(ApiCommon.getQueue);
  if (resultJson.error) {
    toast.error(resultJson.message);
    return;
  }

  yield put(setQueueStatus(resultJson.data));
  yield put(setFetched('queueStatus'));
}

// Events

function* eventMainPageLoad() {
  yield all([
    yield call(SagaDashboard.getDashboardStats),
    yield call(SagaDashboard.getDashboardSeriesSummary),
    yield call(SagaImportFolder.getImportFolders),
    yield call(SagaFile.getRecentFiles),
  ]);

  // yield put({ type: Events.CHECK_UPDATES });
}

function* eventQueueOperation(action) {
  const { payload } = action;
  const funcName = `getQueue${payload}`;

  if (typeof ApiCommon[funcName] !== 'function') {
    toast.error('Unknown operation!');
    return;
  }

  const resultJson = yield call(ApiCommon[funcName]);
  if (resultJson.error) {
    toast.error(resultJson.message);
  } else {
    toast.success('Request Sent!');
  }
}

export default {
  getQueueStatus,
  eventMainPageLoad,
  eventQueueOperation,
};
