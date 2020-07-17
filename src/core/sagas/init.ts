import {
  call, delay, put, select,
} from 'redux-saga/effects';

import Events from '../events';
import { startFetching, stopFetching } from '../slices/fetching';
import {
  setActiveTab, setDatabaseStatus, setStatus, setUserStatus, setUser, setAnidbStatus,
} from '../slices/firstrun';

import ApiInit from '../api/v3/init';

function* getDefaultUser() {
  const resultJson = yield call(ApiInit.getDefaultUser);
  if (resultJson.error) {
    yield put(setUserStatus({ type: 'error', text: resultJson.message }));
    yield delay(2000);
    yield put(setUserStatus({ type: '', text: '' }));
  } else {
    yield put(setUser(resultJson.data));
  }
}

function* getInitStatus() {
  const resultJson = yield call(ApiInit.getStatus);
  if (resultJson.error) {
    yield put(setStatus(resultJson.message));
  } else {
    yield put(setStatus(resultJson.data));
  }
}

function* startServer() {
  yield put({ type: Events.START_API_POLLING, payload: { type: 'server-status' } });
  const resultJson = yield call(ApiInit.getStartServer);
  if (resultJson.error) {
    yield put({ type: Events.STOP_API_POLLING, payload: { type: 'server-status' } });
  }
}

function* setDefaultUser() {
  const data = yield select((state) => {
    const { user } = state.firstrun;
    return {
      Username: user.Username,
      Password: user.Password,
    };
  });
  const resultJson = yield call(ApiInit.postDefaultUser, data);
  if (resultJson.error) {
    yield put(setActiveTab('local-account'));
    yield put(setUserStatus({ type: 'error', text: resultJson.message }));
    yield delay(2000);
    yield put(setUserStatus({ type: '', text: '' }));
  }
}

function* testAniDB() {
  yield put(startFetching('firstrunAnidb'));
  const resultJson = yield call(ApiInit.getAniDBTest);
  yield put(stopFetching('firstrunAnidb'));
  if (resultJson.error) {
    let errorMessage = resultJson.message;
    if (errorMessage.includes('400: Bad Request')) {
      errorMessage = 'Failed to login.';
    }
    yield put(setAnidbStatus({ type: 'error', text: errorMessage }));
  } else {
    yield put(setAnidbStatus({ type: 'success', text: 'AniDB test successful!' }));
  }
  yield delay(2000);
  yield put(setAnidbStatus({ type: '', text: '' }));
}

function* testDatabase() {
  yield put(startFetching('firstrunDatabase'));
  const resultJson = yield call(ApiInit.getDatabaseTest);
  yield put(stopFetching('firstrunDatabase'));
  if (resultJson.error) {
    yield put(setDatabaseStatus({ type: 'error', text: resultJson.message }));
  } else {
    yield put(setDatabaseStatus({ type: 'success', text: 'Database test successful!' }));
  }
  yield delay(2000);
  yield put(setDatabaseStatus({ type: '', text: '' }));
}

export default {
  getDefaultUser,
  getInitStatus,
  startServer,
  setDefaultUser,
  testAniDB,
  testDatabase,
};
