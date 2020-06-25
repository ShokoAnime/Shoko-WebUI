import { call, put } from 'redux-saga/effects';

import Events from '../events';

import ApiCommon from '../api/common';
import ApiImportFolder from '../api/v3/import-folder';
import ApiSeries from '../api/v3/series';

import {
  setFetched, setImportFolders, setImportFolderSeries,
  setSelectedImportFolderSeries,
} from '../slices/mainpage';
import { startFetching, stopFetching } from '../slices/fetching';

function* addImportFolder(action) {
  const resultJson = yield call(ApiImportFolder.postImportFolder, action.payload);
  if (resultJson.error) {
    yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }

  yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'success', text: 'Import folder added!' } });
  yield call(getImportFolders);
}

function* editImportFolder(action) {
  const resultJson = yield call(ApiImportFolder.putImportFolder, action.payload);
  if (resultJson.error) {
    yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }

  yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'success', text: 'Import folder edited!' } });
  yield call(getImportFolders);
}

function* deleteImportFolder(action) {
  const resultJson = yield call(ApiImportFolder.deleteImportFolder, action.payload);
  if (resultJson.error) {
    yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }

  yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'success', text: 'Import folder deleted!' } });
  yield call(getImportFolders);
}

function* getImportFolders() {
  const resultJson = yield call(ApiImportFolder.getImportFolder);
  if (resultJson.error) {
    yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }

  yield put(setImportFolders(resultJson.data));
  yield put(setFetched('importFolders'));
}

function* getImportFolderSeries(action) {
  yield put(setSelectedImportFolderSeries(action.payload));
  yield put(startFetching('importFolderSeries'));
  let resultJson = yield call(ApiCommon.getSerieInfobyfolder, `?id=${action.payload}`);
  if (resultJson.error) {
    yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }
  const seriesArray = resultJson.data.series;
  const seriesTypes = ['Movie', 'OVA', 'TV Series', 'Special', 'Web Series', 'Other'];

  for (let i = 0; i < seriesArray.length; i += 1) { // yield cannot be used in a forEach loop4
    resultJson = yield call(ApiSeries.getSeriesAniDB, seriesArray[i].id);
    seriesArray[i].type = seriesTypes[resultJson.data.SeriesType];
  }

  yield put(setImportFolderSeries(seriesArray));
  yield put(stopFetching('importFolderSeries'));
}

function* runImportFolderRescan(action) {
  const {
    payload,
  } = action;
  const resultJson = yield call(ApiImportFolder.getImportFolderScan, payload);

  if (resultJson.error) {
    yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
  } else {
    yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'success', text: 'Request sent!' } });
  }
}

export default {
  addImportFolder,
  editImportFolder,
  deleteImportFolder,
  getImportFolders,
  getImportFolderSeries,
  runImportFolderRescan,
};
