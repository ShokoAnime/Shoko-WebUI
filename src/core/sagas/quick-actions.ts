import { call, put } from 'redux-saga/effects';

import Events from '../events';

import ApiActions from '../api/v3/actions';

function* runQuickAction(action) {
  const { key, data } = action;

  if (typeof ApiActions[key] !== 'function') {
    yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: 'Unknown action!' } });
  }

  let resultJson: any = {};
  if (data) {
    resultJson = yield call(ApiActions[key], data);
  } else {
    resultJson = yield call(ApiActions[key]);
  }

  if (resultJson.error) {
    yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
  } else {
    yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'success', text: 'Request sent!' } });
  }
}

export default {
  runQuickAction,
};
