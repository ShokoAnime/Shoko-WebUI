import { call, put } from 'redux-saga/effects';

import ApiFile from '../api/v3/file';

import {
  setAvdump,
} from '../slices/mainpage';


function* runAvdump(action) {
  const fileId = action.payload;

  yield put(setAvdump({ [fileId]: { fetching: true } }));
  const resultJson = yield call(ApiFile.postFileAvdump, action.payload);

  yield put(setAvdump({ [fileId]: { fetching: false, hash: resultJson.data.Ed2k } }));
}

function* runRescan(action) {
  yield call(ApiFile.postFileRescan, action.payload);
}

function* runRehash(action) {
  yield call(ApiFile.postFileRehash, action.payload);
}

export default {
  runAvdump,
  runRescan,
  runRehash,
};
