import {
  all, call, put, select, takeEvery,
} from 'redux-saga/effects';
import { forEach } from 'lodash';
import { createAction } from 'redux-actions';
import ApiCommon from '../api/common';

import Events from '../events';

import SagaAlerts from './alerts';
import SagaAuth from './auth';
import SagaFile from './file';
import SagaImportFolder from './import-folder';
import SagaInit from './init';
import SagaQuickAction from './quick-actions';
import SagaMainPage from './mainpage';
import SagaSettings from './settings';

import {
  JMM_VERSION, UPDATE_AVAILABLE,
} from '../actions';
import {
  setItems as setBrowseModalItems, setId as setBrowseModalId,
} from '../slices/modals/browseFolder';
import apiPollingDriver from './apiPollingDriver';

import { startFetching, stopFetching } from '../slices/fetching';

const dispatchAction = (type, payload) => put(createAction(type)(payload));

function* settingsSaveLogRotate(action) {
  const resultJson = yield call(ApiCommon.postLogRotate.bind(this, action.payload));
  if (resultJson.error) {
    yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
  } else {
    yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'success', text: 'Log settings saved!' } });
  }
}

function* checkUpdates() {
  const {
    updateChannel,
  } = yield select(state => state.localSettings.other);
  const resultJson = yield call(ApiCommon.webuiLatest, updateChannel);
  if (resultJson.error) {
    yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }

  yield put({ type: UPDATE_AVAILABLE, payload: resultJson.data });
}

function* serverVersion() {
  yield put(startFetching('serverVersion'));
  const resultJson = yield call(ApiCommon.getVersion);
  yield put(stopFetching('serverVersion'));
  if (resultJson.error) {
    yield dispatchAction(Events.QUEUE_GLOBAL_ALERT, { type: 'error', text: resultJson.message });
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

function* downloadUpdates() {
  yield put(startFetching('downloadUpdates'));
  const channel = yield select(state => state.localSettings.other.updateChannel);
  const resultJson = yield call(ApiCommon.getWebuiUpdate, channel);
  yield put(stopFetching('downloadUpdates'));
  if (resultJson.error) {
    const message = `Oops! Something went wrong! Submit an issue on GitHub so we can fix it. ${resultJson.message}`;
    yield dispatchAction(Events.QUEUE_GLOBAL_ALERT, { type: 'error', text: message, duration: 10000 });
    return;
  }

  const message = 'Update Successful! Please reload the page for the updated version.';
  yield dispatchAction(Events.QUEUE_GLOBAL_ALERT, { type: 'success', text: message, duration: 10000 });
}

function* osBrowse(action) {
  let genId = yield select(state => state.modals.browseFolder.id);
  const {
    id,
    path,
  } = action.payload;
  yield put(startFetching(`browse-treenode-${id}`));
  const resultJson = yield call(path === '' ? ApiCommon.getOsDrives : ApiCommon.postOsFolder,
    path);
  yield put(stopFetching(`browse-treenode-${id}`));
  if (resultJson.error) {
    yield dispatchAction(Events.QUEUE_GLOBAL_ALERT, { type: 'error', text: resultJson.message });
    return;
  }
  const nodes: Array<any> = [];
  forEach(resultJson.data.subdir, (node) => {
    genId += 1;
    nodes.push(Object.assign({}, node, { nodeId: genId }));
  });
  yield put(setBrowseModalId(genId));
  yield put(setBrowseModalItems({ key: id, nodes }));
}

export default function* rootSaga() {
  yield all([
    // OLD
    takeEvery(Events.PAGE_LOGS_LOAD, SagaSettings.getSettings),
    takeEvery(Events.SETTINGS_POST_LOG_ROTATE, settingsSaveLogRotate),
    takeEvery(Events.CHECK_UPDATES, checkUpdates),
    takeEvery(Events.SERVER_VERSION, serverVersion),
    takeEvery(Events.WEBUI_UPDATE, downloadUpdates),
    takeEvery(Events.OS_BROWSE, osBrowse),
    // ALERTS
    takeEvery(Events.QUEUE_GLOBAL_ALERT, SagaAlerts.queueGlobalAlert),
    // API POLLING
    takeEvery(Events.START_API_POLLING, apiPollingDriver),
    // AUTH
    takeEvery(Events.AUTH_CHANGE_PASSWORD, SagaAuth.changePassword),
    takeEvery(Events.AUTH_LOGIN, SagaAuth.login),
    takeEvery(Events.AUTH_LOGOUT, SagaAuth.logout),
    takeEvery(Events.AUTH_SKIP_LOGIN, SagaAuth.skipLogin),
    // FIRSTRUN
    takeEvery(Events.FIRSTRUN_FINISH_SETUP, SagaInit.finishSetup),
    takeEvery(Events.FIRSTRUN_INIT_STATUS, SagaInit.getInitStatus),
    takeEvery(Events.FIRSTRUN_GET_USER, SagaInit.getDefaultUser),
    takeEvery(Events.FIRSTRUN_SET_USER, SagaInit.setDefaultUser),
    takeEvery(Events.FIRSTRUN_START_SERVER, SagaInit.startServer),
    takeEvery(Events.FIRSTRUN_TEST_ANIDB, SagaInit.testAniDB),
    takeEvery(Events.FIRSTRUN_TEST_DATABASE, SagaInit.testDatabase),
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
    // IMPORT FOLDER
    takeEvery(Events.IMPORT_FOLDER_ADD, SagaImportFolder.addImportFolder),
    takeEvery(Events.IMPORT_FOLDER_EDIT, SagaImportFolder.editImportFolder),
    takeEvery(Events.IMPORT_FOLDER_DELETE, SagaImportFolder.deleteImportFolder),
    takeEvery(Events.IMPORT_FOLDER_RESCAN, SagaImportFolder.runImportFolderRescan),
    // SETTINGS
    takeEvery(Events.SETTINGS_GET_SERVER, SagaSettings.getSettings),
    takeEvery(Events.SETTINGS_GET_TRAKT_CODE, SagaSettings.getTraktCode),
    takeEvery(Events.SETTINGS_PLEX_LOGIN_URL, SagaSettings.getPlexLoginUrl),
    takeEvery(Events.SETTINGS_SAVE_SERVER, SagaSettings.saveSettings),
    takeEvery(Events.SETTINGS_SAVE_WEBUI, SagaSettings.saveWebUISettings),
  ]);
}
