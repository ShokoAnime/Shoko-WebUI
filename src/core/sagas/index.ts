import {
  all, call, put, takeEvery,
} from 'redux-saga/effects';
import { forEach } from 'lodash';

import toast from '../../components/Toast';
import ApiCommon from '../api/common';

import Events from '../events';

import SagaAuth from './auth';
import SagaFolder from './folder';
import SagaInit from './init';
import SagaMainPage from './mainpage';
import SagaSettings from './settings';

import { version as jmmVersionAction } from '../slices/jmmVersion';
import apiPollingDriver from './apiPollingDriver';

import { startFetching, stopFetching } from '../slices/fetching';

function* serverVersion() {
  yield put(startFetching('serverVersion'));
  const resultJson = yield call(ApiCommon.getVersion);
  yield put(stopFetching('serverVersion'));
  if (resultJson.error) {
    toast.error(resultJson.message);
    return;
  }

  let version = null;
  forEach(resultJson.data, (value) => {
    if (value.name === 'server') {
      version = value.version;
    }
  });

  yield put(jmmVersionAction(version));
}

export default function* rootSaga() {
  yield all([
    // API POLLING
    takeEvery(Events.START_API_POLLING, apiPollingDriver),
    // AUTH
    takeEvery(Events.AUTH_CHANGE_PASSWORD, SagaAuth.changePassword),
    takeEvery(Events.AUTH_LOGIN, SagaAuth.login),
    takeEvery(Events.AUTH_LOGOUT, SagaAuth.logout),
    // FIRSTRUN
    takeEvery(Events.FIRSTRUN_INIT_STATUS, SagaInit.getInitStatus),
    takeEvery(Events.FIRSTRUN_GET_USER, SagaInit.getDefaultUser),
    takeEvery(Events.FIRSTRUN_SET_USER, SagaInit.setDefaultUser),
    takeEvery(Events.FIRSTRUN_START_SERVER, SagaInit.startServer),
    takeEvery(Events.FIRSTRUN_TEST_ANIDB, SagaInit.testAniDB),
    takeEvery(Events.FIRSTRUN_TEST_DATABASE, SagaInit.testDatabase),
    // FOLDER
    takeEvery(Events.FOLDER_BROWSE, SagaFolder.folderBrowse),
    // MAINPAGE
    takeEvery(Events.MAINPAGE_QUEUE_OPERATION, SagaMainPage.eventQueueOperation),
    takeEvery(Events.MAINPAGE_QUEUE_STATUS, SagaMainPage.getQueueStatus),
    // SERVER
    takeEvery(Events.SERVER_VERSION, serverVersion),
    // SETTINGS
    takeEvery(Events.SETTINGS_CHECK_PLEX_AUTHENTICATED, SagaSettings.getPlexAuthenticated),
    takeEvery(Events.SETTINGS_GET_SERVER, SagaSettings.getSettings),
    takeEvery(Events.SETTINGS_PLEX_LOGIN_URL, SagaSettings.getPlexLoginUrl),
    takeEvery(Events.SETTINGS_SAVE_SERVER, SagaSettings.saveSettings),
    takeEvery(Events.SETTINGS_SAVE_WEBUI_LAYOUT, SagaSettings.saveLayout),
    takeEvery(Events.SETTINGS_UNLINK_PLEX, SagaSettings.unlinkPlex),
  ]);
}
