import { call, put } from 'redux-saga/effects';
import { push, replace } from 'connected-react-router';
import { toast } from 'react-toastify';

import Events from '../events';

import ApiAuth from '../api/auth';

import { setDetails, unsetDetails } from '../slices/apiSession';
import { startFetching, stopFetching } from '../slices/fetching';

function* changePassword(action) {
  const { payload } = action;
  const resultJson = yield call(ApiAuth.postChangePassword, payload.password);
  if (resultJson.error) {
    toast.error(resultJson.message);
    return;
  }

  toast.success('Password changed successfully!');

  const loginPayload = {
    user: payload.username,
    pass: payload.password,
    rememberUser: payload.rememberUser,
    device: 'web-ui',
    redirect: false,
  };
  yield put({ type: Events.AUTH_LOGIN, payload: loginPayload });
}

function* login(action) {
  const { payload } = action;
  yield put(startFetching('login'));

  const resultJson = yield call(ApiAuth.postAuth, payload);
  if (resultJson.error) {
    let errorMessage = resultJson.message;
    if (resultJson.message.includes('401:')) {
      errorMessage = 'Invalid Username or Password';
    }
    toast.error(errorMessage);
    yield put(stopFetching('login'));
    return;
  }

  yield put(setDetails({
    apikey: resultJson.data.apikey, username: payload.user, rememberUser: payload.rememberUser,
  }));

  if ((payload.redirect) ?? true) {
    yield put(push({ pathname: '/main' }));
  }
  yield put(stopFetching('login'));
}

function* logout(action) {
  const { payload } = action;

  yield put(unsetDetails());
  global.localStorage.clear();
  global.sessionStorage.clear();

  if (payload && payload.clearState) {
    yield put({ type: Events.STORE_CLEAR_STATE });
  }
  else {
    yield put(replace({ pathname: '/' }));
  }
}

export default {
  changePassword,
  login,
  logout,
};
