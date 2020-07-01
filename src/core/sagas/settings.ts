import { call, put, select } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import jsonpatch from 'fast-json-patch';
import { isEmpty } from 'lodash';

import { RootState } from '../store';
import Events from '../events';

import ApiCommon from '../api/common';
import ApiPlex from '../api/plex';
import ApiSettings from '../api/v3/settings';

import { startFetching, stopFetching } from '../slices/fetching';
import { saveLocalSettings } from '../slices/localSettings';
import { setFetched } from '../slices/mainpage';
import { setItem as setMiscItem } from '../slices/misc';
import { saveServerSettings } from '../slices/serverSettings';
import {
  addAction, removeAction, saveLayout as saveLayoutAction,
  saveWebUISettings as saveWebUISettingsAction,
} from '../slices/webuiSettings';

function* getPlexLoginUrl() {
  yield put(startFetching('plex_login_url'));
  const resultJson = yield call(ApiPlex.getPlexLoginUrl);
  yield put(stopFetching('plex_login_url'));
  if (resultJson.error) {
    yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
  } else {
    yield put(setMiscItem({ plex: { url: resultJson.data } }));
  }
}

function* getSettings() {
  yield put(startFetching('settings'));
  const resultJson = yield call(ApiSettings.getSettings);
  yield put(stopFetching('settings'));
  if (resultJson.error) {
    yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
  }

  const webUISettings = JSON.parse(resultJson.data.WebUI_Settings || '{}');
  if (!isEmpty(webUISettings)) {
    yield put(saveWebUISettingsAction(webUISettings));
  }
  yield put(saveServerSettings(resultJson.data));
  yield put(saveLocalSettings(resultJson.data));
  yield put(setFetched('settings'));
}

function* getTraktCode() {
  yield put(startFetching('trakt_code'));
  const resultJson = yield call(ApiCommon.getTraktCode);
  yield put(stopFetching('trakt_code'));
  if (resultJson.error) {
    yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
  } else {
    yield put(setMiscItem({ trakt: resultJson.data }));
  }
}

function* saveLayout(action) {
  yield put(saveLayoutAction(action.payload));
  yield call(uploadWebUISettings);
}

type SaveSettingsType = {
  context?: string;
  newSettings: {};
};

function* saveSettings(action: PayloadAction<SaveSettingsType>) {
  const { context, newSettings } = action.payload;
  yield put(saveLocalSettings(context ? { [context]: newSettings } : newSettings));
  const { original, changed } = yield select((state: RootState) => {
    const { localSettings, serverSettings } = state;
    return {
      original: serverSettings,
      changed: localSettings,
    };
  });
  const postData = jsonpatch.compare(original, changed);
  if (postData.length === 0) {
    return;
  }
  const resultJson = yield call(ApiSettings.patchSettings, postData);
  if (resultJson.error) {
    yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
  }
  yield call(getSettings);
}

function* saveWebUISettings(action) {
  const { context, setting } = action.payload;
  yield put(saveWebUISettingsAction(context ? { [context]: setting } : setting));
  yield put({ type: Events.SETTINGS_SAVE_SERVER, payload: { context: 'WebUI_Settings', newSettings: setting } });
}

function* togglePinnedAction(action) {
  const { payload } = action;
  const pinnedActions = yield select((state: RootState) => state.webuiSettings.actions);
  if (pinnedActions.indexOf(payload) === -1) {
    yield put(addAction(payload));
  } else {
    yield put(removeAction(payload));
  }
  yield call(uploadWebUISettings);
}

function* uploadWebUISettings() {
  const data = JSON.stringify(yield select((state: RootState) => state.webuiSettings));
  yield put({ type: Events.SETTINGS_SAVE_SERVER, payload: { context: 'WebUI_Settings', newSettings: data } });
}

export default {
  getPlexLoginUrl,
  getSettings,
  getTraktCode,
  saveLayout,
  saveSettings,
  saveWebUISettings,
  togglePinnedAction,
};
