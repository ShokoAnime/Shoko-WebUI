import { call, put } from 'redux-saga/effects';
import { toast } from 'react-toastify';

import ApiDashboard from '../api/v3/dashboard';

import { setFetched, setSeriesSummary, setStats } from '../slices/mainpage';

function* getDashboardSeriesSummary() {
  const resultJson = yield call(ApiDashboard.getDashboardSeriesSummary);
  if (resultJson.error) {
    toast.error(resultJson.message);
    return;
  }

  if (resultJson.data.Other) {
    resultJson.data.Other += resultJson.data.Special + resultJson.data.Web;
  }
  delete resultJson.data.Special;
  delete resultJson.data.Web;

  yield put(setSeriesSummary(resultJson.data));
  yield put(setFetched('seriesSummary'));
}

function* getDashboardStats() {
  const resultJson = yield call(ApiDashboard.getDashboardStats);
  if (resultJson.error) {
    toast.error(resultJson.message);
    return;
  }

  yield put(setStats(resultJson.data));
  yield put(setFetched('stats'));
}

export default {
  getDashboardSeriesSummary,
  getDashboardStats,
};
