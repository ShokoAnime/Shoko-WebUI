import { call, put } from 'redux-saga/effects';

import toast from '../../components/Toast';

import ApiPlex from '../api/v3/plex';

import { startFetching, stopFetching } from '../slices/fetching';
import { setItem as setMiscItem } from '../slices/misc';

function* getPlexAuthenticated() {
  const resultJson = yield call(ApiPlex.getPlexPinAuthenticated);
  if (resultJson.error) {
    toast.error(resultJson.message);
  } else {
    yield put(setMiscItem({ plex: { authenticated: resultJson.data } }));
  }
}

function* getPlexLoginUrl() {
  yield put(startFetching('plex_login_url'));
  const resultJson = yield call(ApiPlex.getPlexLoginUrl);
  yield put(stopFetching('plex_login_url'));
  if (resultJson.error) {
    toast.error(resultJson.message);
  } else {
    yield put(setMiscItem({ plex: { url: resultJson.data } }));
  }
}

function* unlinkPlex() {
  yield put(startFetching('plex_unlink'));
  const resultJson = yield call(ApiPlex.getPlexTokenInvalidate);
  yield put(stopFetching('plex_unlink'));
  if (resultJson.error) {
    toast.error(resultJson.message);
  } else {
    yield put(setMiscItem({ plex: { authenticated: false, url: '' } }));
  }
}

export default {
  getPlexAuthenticated,
  getPlexLoginUrl,
  unlinkPlex,
};
