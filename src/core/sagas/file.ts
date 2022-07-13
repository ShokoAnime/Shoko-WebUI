import { call, put } from 'redux-saga/effects';
import { toast } from 'react-toastify';
import { get } from 'lodash';

import ApiEpisode from '../api/v3/episode';
import ApiFile from '../api/v3/file';
import ApiSeries from '../api/v3/series';

import {
  setAvdump, setFetched, setRecentFileDetails, setRecentFiles,
  setUnrecognizedFiles,
} from '../slices/mainpage';

import type { RecentFileDetailsType } from '../types/api/file';

function* getRecentFileDetails(action) {
  const { seriesId, episodeId, fileId } = action.payload;
  const details = {} as RecentFileDetailsType;

  const seriesJson = yield call(ApiSeries.getSeries, seriesId);
  if (seriesJson.error) {
    toast.error(seriesJson.message);
    return;
  }
  details.SeriesName = seriesJson.data.Name;
  const imageId = get(seriesJson, 'data.Images.Posters.0.ID', null); 
  if (imageId !== null) {
    details.SeriesImageID = imageId;  
    details.SeriesImageSource = seriesJson.data.Images.Fanarts[0].Source;  
  }

  const episodeJson = yield call(ApiEpisode.getEpisode, episodeId);
  if (episodeJson.error) {
    toast.error(seriesJson.message);
    return;
  }
  details.EpisodeName = episodeJson.data.Name;

  const episodeAniDBJson = yield call(ApiEpisode.getEpisodeAniDB, episodeId);
  if (episodeAniDBJson.error) {
    toast.error(seriesJson.message);
    return;
  }
  details.EpisodeNumber = episodeAniDBJson.data.EpisodeNumber;
  details.EpisodeType = episodeAniDBJson.data.Type;

  const fileAniDBJson = yield call(ApiFile.getFileAniDB, fileId);
  if (fileAniDBJson.error) {
    toast.error(seriesJson.message);
    return;
  }
  details.Source = fileAniDBJson.data.Source;
  details.AudioLanguages = fileAniDBJson.data.AudioLanguages;
  details.SubtitleLanguages = fileAniDBJson.data.SubLanguages;
  details.ReleaseGroup = fileAniDBJson.data.ReleaseGroup.Name;
  // eslint-disable-next-line prefer-destructuring
  details.VideoCodec = fileAniDBJson.data.VideoCodec.split('/')[0];

  yield put(setRecentFileDetails({ [fileId]: { fetched: true, details } }));
}

function* getRecentFiles() {
  const resultJson = yield call(ApiFile.getFileRecentLegacy, 20);
  if (resultJson.error) {
    toast.error(resultJson.message);
    return;
  }

  yield put(setRecentFiles(resultJson.data));
  yield put(setFetched('recentFiles'));
}

function* getUnrecognizedFiles() {
  const resultJson = yield call(ApiFile.getFileUnrecognized);
  if (resultJson.error) {
    toast.error(resultJson.message);
    return;
  }

  yield put(setUnrecognizedFiles(resultJson.data));
  yield put(setFetched('unrecognizedFiles'));
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
  getUnrecognizedFiles,
  runAvdump,
};
