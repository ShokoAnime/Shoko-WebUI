import { call, put } from 'redux-saga/effects';

import Events from '../events';

import ApiCommon from '../api/common';
import ApiFile from '../api/v3/file';

import { setAvdump, setFetched, setRecentFiles } from '../slices/mainpage';
import { startFetching, stopFetching } from '../slices/fetching';

function* getRecentFiles() {
  const resultJson = yield call(ApiCommon.getFileRecent);
  if (resultJson.error) {
    yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }

  yield put(setRecentFiles(resultJson.data));
  yield put(setFetched('recentFiles'));

  yield put(startFetching('recentFileDetails'));
  for (let i = 0; i < resultJson.data.length; i += 1) { // yield cannot be used in a forEach loop
    if (resultJson.data[i].ep_id) {
      const episodeJson = yield call(ApiCommon.getEp, resultJson.data[i].ep_id);
      if (episodeJson.error) {
        yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: episodeJson.message } });
        return;
      }
      resultJson.data[i].epnumber = episodeJson.data.epnumber;
      resultJson.data[i].epname = episodeJson.data.name;
      resultJson.data[i].eptype = episodeJson.data.eptype;

      const seriesJson = yield call(ApiCommon.getSerie, resultJson.data[i].series_id);
      if (seriesJson.error) {
        yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: seriesJson.message } });
        return;
      }
      resultJson.data[i].name = seriesJson.data.name;

      const aniDBJson = yield call(ApiFile.getFileAniDB, resultJson.data[i].id);
      if (aniDBJson.error) {
        yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: aniDBJson.message } });
        return;
      }
      resultJson.data[i].source = aniDBJson.data.Source;
      resultJson.data[i].audioLanguages = aniDBJson.data.AudioLanguages;
      resultJson.data[i].subtitleLanguages = aniDBJson.data.SubLanguages;

      const fileJson = yield call(ApiFile.getFile, resultJson.data[i].id);
      if (fileJson.error) {
        yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: fileJson.message } });
        return;
      }
      resultJson.data[i].resolution = fileJson.data.RoundedStandardResolution;
    }
  }
  yield put(stopFetching('recentFileDetails'));
}

function* runAvdump(action) {
  const fileId = action.payload;

  yield put(setAvdump({ [fileId]: { fetching: true } }));
  const resultJson = yield call(ApiFile.postFileAvdump, action.payload);

  yield put(setAvdump({ [fileId]: { fetching: false, hash: resultJson.data.Ed2k } }));
}

export default {
  getRecentFiles,
  runAvdump,
};
