import { put, call, all } from 'redux-saga/effects';
import { toast } from 'react-toastify';
import { get } from 'lodash';

import ApiGroup from '../api/v3/group';

import { setGroups } from '../slices/collection';

function* eventCollectionPageLoad() {
  yield all([
    yield call(getGroups, { payload: 1 }),
  ]);
}

function* getGroups(action) {
  const page = get(action, 'payload', 1);
  const resultJson = yield call(ApiGroup.getGroup, page);
  if (resultJson.error) {
    toast.error(resultJson.message);
    return;
  }
  
  yield put(setGroups({ items: resultJson.data, page }));
}

export default {
  eventCollectionPageLoad,
  getGroups,
};