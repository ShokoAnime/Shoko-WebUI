import { call, put } from 'redux-saga/effects';

import Events from '../events';

import ApiEpisode from '../api/v3/episode';
import ApiFile from '../api/v3/file';
import ApiSeries from '../api/v3/series';

import {
  setAvdump, setFetched, setRecentFileDetails, setRecentFiles,
} from '../slices/mainpage';

import type { RecentFileDetailsType } from '../types/api/file';

function* getRecentFileDetails(action) {
  const { seriesId, episodeId, fileId } = action.payload;
  const details = {} as RecentFileDetailsType;

  const seriesJson = yield call(ApiSeries.getSeries, seriesId);
  if (seriesJson.error) {
    yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: seriesJson.message } });
    return;
  }
  details.SeriesName = seriesJson.data.Name;

  const episodeAniDBJson = yield call(ApiEpisode.getEpisodeAniDB, episodeId);
  if (episodeAniDBJson.error) {
    yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: seriesJson.message } });
    return;
  }
  details.EpisodeNumber = episodeAniDBJson.data.EpisodeNumber;
  details.EpisodeType = episodeAniDBJson.data.EpisodeType;

  const episodeTvDBJson = yield call(ApiEpisode.getEpisodeTvDB, episodeId);
  if (episodeTvDBJson.error) {
    yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: seriesJson.message } });
    return;
  }
  details.EpisodeName = episodeTvDBJson.data[0].Title;

  const fileAniDBJson = yield call(ApiFile.getFileAniDB, fileId);
  if (fileAniDBJson.error) {
    yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: seriesJson.message } });
    return;
  }
  details.Source = fileAniDBJson.data.Source;
  details.AudioLanguages = fileAniDBJson.data.AudioLanguages;
  details.SubtitleLanguages = fileAniDBJson.data.SubLanguages;

  yield put(setRecentFileDetails({ [fileId]: { fetched: true, details } }));
}

function* getRecentFiles() {
  const resultJson = yield call(ApiFile.getFileRecent);
  if (resultJson.error) {
    yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }

  yield put(setRecentFiles(resultJson.data));
  yield put(setFetched('recentFiles'));
}

function* runAvdump(action) {
  const fileId = action.payload;

  yield put(setAvdump({ [fileId]: { fetching: true } }));
  const resultJson = yield call(ApiFile.postFileAvdump, action.payload);

  yield put(setAvdump({ [fileId]: { fetching: false, hash: resultJson.data.Ed2k } }));
}

export default {
  getRecentFileDetails,
  getRecentFiles,
  runAvdump,
};
