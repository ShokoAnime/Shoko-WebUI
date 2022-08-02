import { put, call, all } from 'redux-saga/effects';
import { toast } from 'react-toastify';
import { get } from 'lodash';

import ApiGroup from '../api/v3/group';
import ApiFilters from '../api/v3/filter';

import { setGroups, setGroupSeries } from '../slices/collection';
import { setFilters } from '../slices/modals/filters';

function* eventCollectionPageLoad() {
  yield all([
    yield call(getGroups, { payload: 1 }),
  ]);
}

function* getGroups(action) {
  const page = get(action, 'payload', 1);
  const resultJson = yield call(ApiGroup.getAllGroups, page);
  if (resultJson.error) {
    toast.error(resultJson.message);
    return;
  }
  
  yield put(setGroups({ total: resultJson.data.Total, items: resultJson.data.List, page }));
}

function* getGroupSeries(action) {
  const groupId = get(action, 'payload', null);
  if (groupId === null) {
    toast.error('Trying to fetch series for a null group.');
    return;
  }

  const resultJson = yield call(ApiGroup.getGroupSeries, groupId);
  if (resultJson.error) {
    toast.error(resultJson.message);
    return;
  }

  yield put(setGroupSeries(resultJson.data));
}

function* getFilters() {
  const resultJson = yield call(ApiFilters.getFilters);
  if (resultJson.error) {
    toast.error(resultJson.message);
    return;
  }

  yield put(setFilters(resultJson.data.List));
}

export default {
  eventCollectionPageLoad,
  getGroups,
  getGroupSeries,
  getFilters,
};