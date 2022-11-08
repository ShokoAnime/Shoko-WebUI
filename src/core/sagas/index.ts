import { all, takeEvery } from 'redux-saga/effects';

import Events from '../events';

import SagaAuth from './auth';
import SagaFolder from './folder';
import SagaMainPage from './mainpage';
import SagaSettings from './settings';

import apiPollingDriver from './apiPollingDriver';

export default function* rootSaga() {
  yield all([
    // API POLLING
    takeEvery(Events.START_API_POLLING, apiPollingDriver),
    // AUTH
    takeEvery(Events.AUTH_CHANGE_PASSWORD, SagaAuth.changePassword),
    takeEvery(Events.AUTH_LOGOUT, SagaAuth.logout),
    // FOLDER
    takeEvery(Events.FOLDER_BROWSE, SagaFolder.folderBrowse),
    // MAINPAGE
    takeEvery(Events.MAINPAGE_QUEUE_OPERATION, SagaMainPage.eventQueueOperation),
    // SETTINGS
    takeEvery(Events.SETTINGS_CHECK_PLEX_AUTHENTICATED, SagaSettings.getPlexAuthenticated),
    takeEvery(Events.SETTINGS_PLEX_LOGIN_URL, SagaSettings.getPlexLoginUrl),
    takeEvery(Events.SETTINGS_UNLINK_PLEX, SagaSettings.unlinkPlex),
  ]);
}
