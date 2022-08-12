import { call, put } from 'redux-saga/effects';
import { toast } from 'react-toastify';

import ApiCommon from '../api/common';
import ApiSeries from '../api/v3/series';

import { setImportFolderSeries } from '../slices/mainpage';
import { startFetching, stopFetching } from '../slices/fetching';

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

export default {
  getImportFolderSeries,
};
