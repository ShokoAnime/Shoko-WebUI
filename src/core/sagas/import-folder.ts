import { call, put } from 'redux-saga/effects';
import { toast } from 'react-toastify';

import ApiCommon from '../api/common';
import ApiImportFolder from '../api/v3/import-folder';
import ApiSeries from '../api/v3/series';

import { setFetched, setImportFolders, setImportFolderSeries } from '../slices/mainpage';
import { startFetching, stopFetching } from '../slices/fetching';
import { setStatus as setImportFolderModalStatus } from '../slices/modals/importFolder';

function* addImportFolder(action) {
  const resultJson = yield call(ApiImportFolder.postImportFolder, action.payload);
  if (resultJson.error) {
    toast.error(resultJson.message);
    return;
  }

  toast.success('Import folder added!');
  yield put(setImportFolderModalStatus(false));
  yield call(getImportFolders);
}

function* editImportFolder(action) {
  const resultJson = yield call(ApiImportFolder.putImportFolder, action.payload);
  if (resultJson.error) {
    toast.error(resultJson.message);
    return;
  }

  toast.success('Import folder edited!');
  yield put(setImportFolderModalStatus(false));
  yield call(getImportFolders);
}

function* deleteImportFolder(action) {
  const resultJson = yield call(ApiImportFolder.deleteImportFolder, action.payload);
  if (resultJson.error) {
    toast.error(resultJson.message);
    return;
  }

  toast.success('Import folder deleted!');
  yield put(setImportFolderModalStatus(false));
  yield call(getImportFolders);
}

function* getImportFolders() {
  const resultJson = yield call(ApiImportFolder.getImportFolder);
  if (resultJson.error) {
    toast.error(resultJson.message);
    return;
  }

  yield put(setImportFolders(resultJson.data));
  yield put(setFetched('importFolders'));
}

function* getImportFolderSeries(action) {
  yield put(startFetching('importFolderSeries'));
  let resultJson = yield call(ApiCommon.getSerieInfobyfolder, `?id=${action.payload}`);
  if (resultJson.error) {
    toast.error(resultJson.message);
    return;
  }
  const seriesArray = resultJson.data.series;
  const seriesTypes = ['Movie', 'OVA', 'TV Series', 'Special', 'Web Series', 'Other'];

  for (let i = 0; i < (seriesArray ?? []).length; i += 1) { // yield cannot be used in forEach loop
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
    toast.error(resultJson.message);
  } else {
    toast.success('Request Sent!');
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
