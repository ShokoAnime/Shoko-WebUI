import {
  call, put, select, delay,
} from 'redux-saga/effects';
import { toast } from 'react-toastify';

import ApiWebUi from '../api/webui';

import { RootState } from '../store';
import Version from '../../../public/version.json';
import Events from '../events';

import { startFetching, stopFetching } from '../slices/fetching';
import { setItem } from '../slices/misc';

function* checkUpdates() {
  yield put(startFetching('checkingUpdates'));
  const channel = yield select((state: RootState) => state.webuiSettings.webui_v2.updateChannel);
  const resultJson = yield call(ApiWebUi.getWebuiLatest, channel);
  yield put(stopFetching('checkingUpdates'));
  if (resultJson.error) {
    toast.error(resultJson.message);
    return;
  }
  const webuiUpdateAvailable = !Version.debug && resultJson.data.version !== Version.package;
  yield put(setItem({ webuiUpdateAvailable }));
}

function* downloadUpdates() {
  yield put(startFetching('downloadUpdates'));
  const channel = yield select((state: RootState) => state.webuiSettings.webui_v2.updateChannel);
  const resultJson = yield call(ApiWebUi.getWebuiUpdate, channel);
  yield put(stopFetching('downloadUpdates'));
  if (resultJson.error) {
    const message = `Oops! Something went wrong! Submit an issue on GitHub so we can fix it. ${resultJson.message}`;
    toast.error(message, {
      autoClose: 10000,
    });
    return;
  }

  toast.success('Update Successful! You will be logged out in 5 seconds. Please login again to use the WebUI.', {
    autoClose: 5000,
  });
  yield delay(5000);
  yield put({ type: Events.AUTH_LOGOUT, payload: { clearState: true } });
}

export default {
  checkUpdates,
  downloadUpdates,
};
