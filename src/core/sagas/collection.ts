import { put, call } from 'redux-saga/effects';
import { toast } from 'react-toastify';

import ApiGroup from '../api/v3/group';

import { setGroups } from '../slices/collection';

function* getGroups() {
  const resultJson = yield call(ApiGroup.getGroup);
  if (resultJson.error) {
    toast.error(resultJson.message);
    return;
  }
  
  yield put(setGroups(resultJson.data));
}

export default {
  getGroups,
};