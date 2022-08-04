import { put, call } from 'redux-saga/effects';
import { toast } from 'react-toastify';

import ApiFilters from '../api/v3/filter';

import { setFilters } from '../slices/modals/filters';

function* getFilters() {
  const resultJson = yield call(ApiFilters.getFilters);
  if (resultJson.error) {
    toast.error(resultJson.message);
    return;
  }

  yield put(setFilters(resultJson.data.List));
}

export default {
  getFilters,
};