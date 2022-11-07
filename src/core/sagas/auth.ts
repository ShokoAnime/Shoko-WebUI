import { call, put } from 'redux-saga/effects';
import { replace } from '@lagunovsky/redux-react-router';

import toast from '../../components/Toast';
import Events from '../events';

import ApiAuth from '../api/auth';

import { unsetDetails } from '../slices/apiSession';

function* changePassword(action) {
  const { payload } = action;
  const resultJson = yield call(ApiAuth.postChangePassword, payload.password);
  if (resultJson.error) {
    toast.error(resultJson.message);
    return;
  }

  toast.success('Password changed successfully!');
}

function* logout(action) {
  const { payload } = action;

  yield put(unsetDetails());
  global.localStorage.clear();
  global.sessionStorage.clear();

  if (payload && payload.clearState) {
    yield put({ type: Events.STORE_CLEAR_STATE });
  } else {
    yield put(replace({ pathname: 'login' }));
  }
}

export default {
  changePassword,
  logout,
};
