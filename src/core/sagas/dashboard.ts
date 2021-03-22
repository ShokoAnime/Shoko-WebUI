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

  const { data } = resultJson;
  data.Other = data.Other + data.Special + data.Web + data.None;
  delete data.Special;
  delete data.Web;
  delete data.None;

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
