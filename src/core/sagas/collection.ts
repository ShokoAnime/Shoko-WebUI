import { put, call, all } from 'redux-saga/effects';
import { toast } from 'react-toastify';
import { get } from 'lodash';

import ApiGroup from '../api/v3/group';

import { setGroups, setGroupSeries } from '../slices/collection';

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

export default {
  eventCollectionPageLoad,
  getGroups,
  getGroupSeries,
};