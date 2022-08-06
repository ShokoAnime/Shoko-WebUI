import { call, put } from 'redux-saga/effects';
import { toast } from 'react-toastify';

import ApiFile from '../api/v3/file';

import {
  setAvdump, setFetched,
  setUnrecognizedFiles,
} from '../slices/mainpage';

function* getUnrecognizedFiles() {
  const resultJson = yield call(ApiFile.getFileUnrecognized);
  if (resultJson.error) {
    toast.error(resultJson.message);
    return;
  }

  yield put(setUnrecognizedFiles(resultJson.data.List));
  yield put(setFetched('unrecognizedFiles'));
}

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
  getUnrecognizedFiles,
  runAvdump,
  runRescan,
  runRehash,
};
