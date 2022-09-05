import { put, call } from 'redux-saga/effects';

import toast from '../../components/Toast';
import ApiCommon from '../api/common';
import { setFetched, setQueueStatus } from '../slices/mainpage';

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
  eventQueueOperation,
};
