import { call, delay, put } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { push } from '@lagunovsky/redux-react-router';

import Events from '../events';
import { startFetching, stopFetching } from '../slices/fetching';
import {
  setDatabaseStatus, setServerStatus, setUserStatus, setUser, setAnidbStatus,
  setSaved as setFirstRunSaved,
} from '../slices/firstrun';

import ApiInit from '../api/v3/init';
import ApiSettings from '../api/v3/settings';

import type { DefaultUserType } from '../types/api/init';
import type { SettingsAnidbLoginType } from '../types/api/settings';

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
    yield put(setServerStatus(resultJson.message));
  } else {
    yield put(setServerStatus(resultJson.data));
  }
}

function* startServer() {
  yield put({ type: Events.START_API_POLLING, payload: { type: 'server-status' } });
  const resultJson = yield call(ApiInit.getStartServer);
  if (resultJson.error) {
    yield put({ type: Events.STOP_API_POLLING, payload: { type: 'server-status' } });
  }
}

function* setDefaultUser(action: PayloadAction<DefaultUserType>) {
  yield put(startFetching('firstrunLocalAcc'));
  const resultJson = yield call(ApiInit.postDefaultUser, action.payload);
  yield put(stopFetching('firstrunLocalAcc'));
  if (resultJson.error) {
    yield put(setUserStatus({ type: 'error', text: resultJson.message }));
  } else {
    yield put(setUserStatus({ type: 'success', text: 'Account creation successful!' }));
    yield put(setFirstRunSaved('local-account'));
    yield put(push('anidb-account'));
  }
}

function* testAniDB(action: PayloadAction<SettingsAnidbLoginType>) {
  yield put(startFetching('firstrunAnidb'));
  const resultJson = yield call(ApiSettings.postAniDBTestLogin, action.payload);
  yield put(stopFetching('firstrunAnidb'));
  if (resultJson.error) {
    yield put(setAnidbStatus({ type: 'error', text: resultJson.message }));
  } else {
    yield put(setAnidbStatus({ type: 'success', text: 'AniDB test successful!' }));
    yield put({ type: Events.SETTINGS_SAVE_SERVER, payload: { context: 'AniDb', newSettings: action.payload } });
    yield put(setFirstRunSaved('anidb-account'));
    yield put(push('community-sites'));
  }
}

function* testDatabase() {
  yield put(startFetching('firstrunDatabase'));
  const resultJson = yield call(ApiInit.getDatabaseTest);
  yield put(stopFetching('firstrunDatabase'));
  if (resultJson.error) {
    yield put(setDatabaseStatus({ type: 'error', text: resultJson.message }));
  } else {
    yield put(setFirstRunSaved('db-setup'));
    yield put(setDatabaseStatus({ type: 'success', text: 'Database test successful!' }));
    yield put(push('local-account'));
  }
}

export default {
  getDefaultUser,
  getInitStatus,
  startServer,
  setDefaultUser,
  testAniDB,
  testDatabase,
};
