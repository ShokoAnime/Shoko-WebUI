import {
  all, call, put, takeEvery, throttle,
} from 'redux-saga/effects';
import { forEach } from 'lodash';
import { createAction } from 'redux-actions';
import { toast } from 'react-toastify';

import ApiCommon from '../api/common';

import Events from '../events';

import SagaAuth from './auth';
import SagaFile from './file';
import SagaFolder from './folder';
import SagaImportFolder from './import-folder';
import SagaInit from './init';
import SagaQuickAction from './quick-actions';
import SagaMainPage from './mainpage';
import SagaSettings from './settings';
import SagaWebUi from './webui';

import {
  JMM_VERSION,
} from '../actions';
import apiPollingDriver from './apiPollingDriver';

import { startFetching, stopFetching } from '../slices/fetching';

const dispatchAction = (type, payload) => put(createAction(type)(payload));

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

  yield dispatchAction(JMM_VERSION, version);
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
    // QUICK ACTIONS
    takeEvery(Events.QUICK_ACTION_RUN, SagaQuickAction.runQuickAction),
    // MAINPAGE
    takeEvery(Events.MAINPAGE_FILE_AVDUMP, SagaFile.runAvdump),
    takeEvery(Events.MAINPAGE_IMPORT_FOLDER_SERIES, SagaImportFolder.getImportFolderSeries),
    takeEvery(Events.MAINPAGE_LOAD, SagaMainPage.eventMainPageLoad),
    takeEvery(Events.MAINPAGE_QUEUE_OPERATION, SagaMainPage.eventQueueOperation),
    takeEvery(Events.MAINPAGE_QUEUE_STATUS, SagaMainPage.getQueueStatus),
    takeEvery(Events.MAINPAGE_RECENT_FILE_DETAILS, SagaFile.getRecentFileDetails),
    takeEvery(Events.MAINPAGE_RECENT_FILES, SagaFile.getRecentFiles),
    throttle(1500, Events.MAINPAGE_REFRESH, SagaMainPage.eventMainPageLoad),
    // IMPORT FOLDER
    takeEvery(Events.IMPORT_FOLDER_ADD, SagaImportFolder.addImportFolder),
    takeEvery(Events.IMPORT_FOLDER_EDIT, SagaImportFolder.editImportFolder),
    takeEvery(Events.IMPORT_FOLDER_DELETE, SagaImportFolder.deleteImportFolder),
    takeEvery(Events.IMPORT_FOLDER_RESCAN, SagaImportFolder.runImportFolderRescan),
    // SERVER
    takeEvery(Events.SERVER_VERSION, serverVersion),
    // SETTINGS
    takeEvery(Events.SETTINGS_ANIDB_TEST, SagaSettings.aniDBTest),
    takeEvery(Events.SETTINGS_GET_SERVER, SagaSettings.getSettings),
    takeEvery(Events.SETTINGS_GET_TRAKT_CODE, SagaSettings.getTraktCode),
    takeEvery(Events.SETTINGS_PLEX_LOGIN_URL, SagaSettings.getPlexLoginUrl),
    takeEvery(Events.SETTINGS_SAVE_SERVER, SagaSettings.saveSettings),
    takeEvery(Events.SETTINGS_SAVE_WEBUI, SagaSettings.saveWebUISettings),
    takeEvery(Events.SETTINGS_SAVE_WEBUI_LAYOUT, SagaSettings.saveLayout),
    takeEvery(Events.SETTINGS_TOGGLE_PINNED_ACTION, SagaSettings.togglePinnedAction),
    // WEBUI
    takeEvery(Events.WEBUI_CHECK_UPDATES, SagaWebUi.checkUpdates),
    takeEvery(Events.WEBUI_UPDATE, SagaWebUi.downloadUpdates),
  ]);
}
