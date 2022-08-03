import { call, put } from 'redux-saga/effects';
import { toast } from 'react-toastify';
import { get } from 'lodash';
import { PayloadAction } from '@reduxjs/toolkit';

import Api from '../api/index';
import ApiDashboard from '../api/v3/dashboard';

import {
  setFetched,
  unsetFetched,
  setContinueWatching,
  setNextUp,
  setUpcomingAnime,
  setNews,
} from '../slices/mainpage';

function* getDashboardContinueWatching() {
  const resultJson = yield call(ApiDashboard.getDashboardContinueWatchingEpisodes);
  if (resultJson.error) {
    toast.error(resultJson.message);
    return;
  }

  yield put(setContinueWatching(resultJson.data));
  yield put(setFetched('continueWatching'));
}

function* getDashboardNextUp() {
  const resultJson = yield call(ApiDashboard.getDashboardNextUpEpisodes);
  if (resultJson.error) {
    toast.error(resultJson.message);
    return;
  }

  yield put(setNextUp(resultJson.data));
  yield put(setFetched('nextUp'));
}

function* getDashboardUpcomingAnime(action: PayloadAction<boolean>) {
  yield put(unsetFetched('upcomingAnime'));
  const resultJson = yield call(ApiDashboard.getDashboardAniDBCalendar, action.payload);
  if (resultJson.error) {
    toast.error(resultJson.message);
    return;
  }

  yield put(setUpcomingAnime(resultJson.data));
  yield put(setFetched('upcomingAnime'));
}

function* getDashboardNews() {
  const resultJson = yield call(Api.fetchNews);
  if (resultJson.error) {
    toast.error(resultJson.message);
    return;
  }
  yield put(setNews(get(resultJson, 'data.items', [])));
  yield put(setFetched('news'));
}

export default {
  getDashboardContinueWatching,
  getDashboardNextUp,
  getDashboardUpcomingAnime,
  getDashboardNews,
};
