import { put, call } from 'redux-saga/effects';

import toast from '../../components/Toast';
import ApiCommon from '../api/common';
import { setFetched, setQueueStatus } from '../slices/mainpage';

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
  eventQueueOperation,
};
