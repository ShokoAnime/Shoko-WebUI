import { call } from 'redux-saga/effects';
import { toast } from 'react-toastify';

import ApiActions from '../api/v3/actions';

function* runQuickAction(action) {
  const { key, data } = action.payload;

  if (typeof ApiActions[key] !== 'function') {
    toast.error('Unknown action!');
  }

  let resultJson: any = {};
  if (data) {
    resultJson = yield call(ApiActions[key], data);
  } else {
    resultJson = yield call(ApiActions[key]);
  }

  if (resultJson.error) {
    toast.error(resultJson.message);
  } else {
    toast.success('Request Sent!');
  }
}

export default {
  runQuickAction,
};
