import { all, put, call } from 'redux-saga/effects';
import { forEach } from 'lodash';
import Api from '../api/common';
import {
  QUEUE_GLOBAL_ALERT, QUEUE_STATUS, RECENT_FILES, IMPORT_FOLDERS,
  JMM_NEWS, DASHBOARD_STATS, DASHBOARD_SERIES_SUMMARY,
} from '../actions';
import { SET_THEME, SET_NOTIFICATIONS } from '../actions/settings/UI';
import { SET_LOG_DELTA, SET_UPDATE_CHANNEL } from '../actions/settings/Other';
import Events from '../events';
import { settingsQuickActions } from '../actions/settings/QuickActions';

function* getSettings() {
  const resultJson = yield call(Api.getWebuiConfig);

  if (resultJson.error) {
    if (resultJson.code === 404) { return; }
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }
  const {
    data,
  } = resultJson;

  yield put({ type: SET_THEME, payload: data.uiTheme });
  yield put({ type: SET_NOTIFICATIONS, payload: data.uiNotifications });
  yield put({ type: SET_LOG_DELTA, payload: data.otherLogDelta });
  yield put({ type: SET_UPDATE_CHANNEL, payload: data.otherUpdateChannel });
  if (data.quickActions) {
    let slot = 0;
    yield all(forEach(data.quickActions, (item) => {
      slot += 1;
      return put(settingsQuickActions({ slot, id: item }));
    }));
  }
}

function* getQueueStatus() {
  const resultJson = yield call(Api.queueStatus);
  if (resultJson.error) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }

  yield put({ type: QUEUE_STATUS, payload: resultJson.data });
}

function* queueOperation(action) {
  const {
    payload,
  } = action;
  const funcName = `get${payload}`;

  if (typeof Api[funcName] !== 'function') {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: 'Unknown action!' } });
    return;
  }

  const resultJson = yield call(Api[funcName]);
  if (resultJson.error) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
  } else {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'success', text: 'Request sent!' } });
  }
}

function* getRecentFiles() {
  const resultJson = yield call(Api.getFileRecent);
  for (let i = 0; i < resultJson.data.length; i += 1) { // yield cannot be used in a forEach loop
    resultJson.data[i].created = new Date(resultJson.data[i].created);
    resultJson.data[i].updated = new Date(resultJson.data[i].updated);

    if (resultJson.data[i].ep_id) {
      const episodeJson = yield call(Api.getEp, resultJson.data[i].ep_id);
      if (episodeJson.error) {
        yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: episodeJson.message } });
        return;
      }
      resultJson.data[i].epnumber = episodeJson.data.epnumber;
      resultJson.data[i].epname = episodeJson.data.name;
      resultJson.data[i].eptype = episodeJson.data.eptype;

      const seriesJson = yield call(Api.getSerie, resultJson.data[i].series_id);
      if (seriesJson.error) {
        yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: seriesJson.message } });
        return;
      }
      resultJson.data[i].name = seriesJson.data.name;

      const aniDBJson = yield call(Api.getFileAniDB, resultJson.data[i].id);
      if (aniDBJson.error) {
        yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: aniDBJson.message } });
        return;
      }
      resultJson.data[i].source = aniDBJson.data.Source;
      resultJson.data[i].audioLanguages = aniDBJson.data.AudioLanguages;
      resultJson.data[i].subtitleLanguages = aniDBJson.data.SubLanguages;

      const fileJson = yield call(Api.getFile, resultJson.data[i].id);
      if (fileJson.error) {
        yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: fileJson.message } });
        return;
      }
      resultJson.data[i].resolution = fileJson.data.RoundedStandardResolution;
    }
  }

  if (resultJson.error) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }

  yield put({ type: RECENT_FILES, payload: resultJson.data });
}

function* updateOverview() {
  yield call(getQueueStatus);

  let resultJson = yield call(Api.getImportFolder);
  if (resultJson.error) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }

  yield put({ type: IMPORT_FOLDERS, payload: resultJson.data });

  resultJson = yield call(Api.getDashboardStats);
  if (resultJson.error) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }

  yield put({ type: DASHBOARD_STATS, payload: resultJson.data });

  resultJson = yield call(Api.getDashboardSeriesSummary);
  if (resultJson.error) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }

  resultJson.data.Other += resultJson.data.Special + resultJson.data.Web;
  delete resultJson.data.Special;
  delete resultJson.data.Web;

  yield put({ type: DASHBOARD_SERIES_SUMMARY, payload: resultJson.data });
}

function* eventDashboardQueueStatus() {
  yield call(getQueueStatus);
}

function* eventDashboardRecentFiles() {
  yield call(getRecentFiles);
}

function* eventDashboardLoad() {
  yield call(getQueueStatus);
  yield call(getRecentFiles);

  let resultJson = yield call(Api.getImportFolder);
  if (resultJson.error) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }

  yield put({ type: IMPORT_FOLDERS, payload: resultJson.data });

  yield call(getSettings);

  resultJson = yield call(Api.getDashboardStats);
  if (resultJson.error) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }

  yield put({ type: DASHBOARD_STATS, payload: resultJson.data });

  resultJson = yield call(Api.getDashboardSeriesSummary);
  if (resultJson.error) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }

  resultJson.data.Other += resultJson.data.Special + resultJson.data.Web;
  delete resultJson.data.Special;
  delete resultJson.data.Web;

  yield put({ type: DASHBOARD_SERIES_SUMMARY, payload: resultJson.data });

  resultJson = yield call(Api.newsGet);
  if (resultJson.error) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
  } else {
    yield put({ type: JMM_NEWS, payload: resultJson.data });
  }

  yield put({ type: Events.CHECK_UPDATES });
  // yield put({ type: Events.START_API_POLLING, payload: { type: 'auto-refresh' } });
}

export default {
  queueOperation,
  eventDashboardLoad,
  eventDashboardQueueStatus,
  eventDashboardRecentFiles,
  updateOverview,
};
