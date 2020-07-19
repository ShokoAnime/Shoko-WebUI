import { call, put, select } from 'redux-saga/effects';
import { toast } from 'react-toastify';

import ApiWebUi from '../api/webui';

import { RootState } from '../store';
import Version from '../../../public/version.json';

import { startFetching, stopFetching } from '../slices/fetching';
import { setItem } from '../slices/misc';

function* checkUpdates() {
  const channel = yield select((state: RootState) => state.webuiSettings.v3.updateChannel);
  const resultJson = yield call(ApiWebUi.getWebuiLatest, channel);
  if (resultJson.error) {
    toast.error(resultJson.message);
    return;
  }
  const webuiUpdateAvailable = !Version.debug && resultJson.data.version !== Version.package;
  yield put(setItem({ webuiUpdateAvailable }));
}

function* downloadUpdates() {
  yield put(startFetching('downloadUpdates'));
  const channel = yield select((state: RootState) => state.webuiSettings.v3.updateChannel);
  const resultJson = yield call(ApiWebUi.getWebuiUpdate, channel);
  yield put(stopFetching('downloadUpdates'));
  if (resultJson.error) {
    const message = `Oops! Something went wrong! Submit an issue on GitHub so we can fix it. ${resultJson.message}`;
    toast.error(message, {
      autoClose: 10000,
    });
    return;
  }

  const message = 'Update Successful! Please reload the page for the updated version.';
  toast.success(message, {
    autoClose: 10000,
  });
}

export default {
  checkUpdates,
  downloadUpdates,
};
