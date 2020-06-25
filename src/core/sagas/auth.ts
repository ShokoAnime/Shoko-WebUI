import { call, put } from 'redux-saga/effects';
import { push } from 'connected-react-router';

import Events from '../events';

import ApiAuth from '../api/v3/auth';

import { setDetails, unsetDetails } from '../slices/apiSession';
import { startFetching, stopFetching } from '../slices/fetching';

function* changePassword(action) {
  const { payload } = action;
  const resultJson = yield call(ApiAuth.postChangePassword, payload.password);
  if (resultJson.error) {
    yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }

  yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'success', text: 'Password changed successfully!' } });

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
    yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: errorMessage } });
    yield call(logout);
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

function* logout() {
  yield put(unsetDetails());
  global.localStorage.clear();
  yield put(push({ pathname: '/' }));
}

function* skipLogin() {
  yield put(push({ pathname: '/main' }));
}

export default {
  changePassword,
  login,
  logout,
  skipLogin,
};
