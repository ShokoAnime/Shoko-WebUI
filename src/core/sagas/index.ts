import { all, takeEvery } from 'redux-saga/effects';

import Events from '../events';

import SagaFolder from './folder';

export default function* rootSaga() {
  yield all([
    // FOLDER
    takeEvery(Events.FOLDER_BROWSE, SagaFolder.folderBrowse),
  ]);
}
