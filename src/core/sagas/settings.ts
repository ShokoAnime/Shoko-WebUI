import { call, put, select } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import jsonpatch from 'fast-json-patch';
import { isEmpty } from 'lodash';
import { toast } from 'react-toastify';

import { RootState } from '../store';
import Events from '../events';

import ApiCommon from '../api/common';
import ApiPlex from '../api/plex';
import ApiSettings from '../api/v3/settings';

import { startFetching, stopFetching } from '../slices/fetching';
import { saveLocalSettings } from '../slices/localSettings';
import { setItem as setMiscItem } from '../slices/misc';
import { saveServerSettings } from '../slices/serverSettings';
import {
  addAction, removeAction, saveLayout as saveLayoutAction,
  saveWebUISettings as saveWebUISettingsAction,
} from '../slices/webuiSettings';

import type { SettingsAnidbLoginType } from '../types/api/settings';

function* aniDBTest(action: PayloadAction<SettingsAnidbLoginType>) {
  const { Username, Password } = action.payload;
  yield put(startFetching('aniDBTest'));
  const resultJson = yield call(ApiSettings.postAniDBTestLogin, { Username, Password });
  yield put(stopFetching('aniDBTest'));
  if (resultJson.error) {
    toast.error(resultJson.message);
  } else {
    toast.success('Saved Successfully!');
    yield put({ type: Events.SETTINGS_SAVE_SERVER, payload: { context: 'AniDb', newSettings: action.payload } });
  }
}

function* getPlexLoginUrl() {
  yield put(startFetching('plex_login_url'));
  const resultJson = yield call(ApiPlex.getPlexLoginUrl);
  yield put(stopFetching('plex_login_url'));
  if (resultJson.error) {
    toast.error(resultJson.message);
  } else {
    yield put(setMiscItem({ plex: { url: resultJson.data } }));
  }
}

function* getSettings() {
  yield put(startFetching('settings'));
  const resultJson = yield call(ApiSettings.getSettings);
  yield put(stopFetching('settings'));
  if (resultJson.error) {
    toast.error(resultJson.message);
  }

  const webUISettings = JSON.parse(resultJson.data.WebUI_Settings || '{}');
  if (!isEmpty(webUISettings)) {
    yield put(saveWebUISettingsAction(webUISettings.v3));
  }
  yield put(saveServerSettings(resultJson.data));
  yield put(saveLocalSettings(resultJson.data));
}

function* getTraktCode() {
  yield put(startFetching('trakt_code'));
  const resultJson = yield call(ApiCommon.getTraktCode);
  yield put(stopFetching('trakt_code'));
  if (resultJson.error) {
    toast.error(resultJson.message);
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
  skipValidation?: boolean;
};

function* saveSettings(action: PayloadAction<SaveSettingsType>) {
  const { context, newSettings, skipValidation } = action.payload;
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
  const resultJson = yield call(ApiSettings.patchSettings, { postData, skipValidation });
  if (resultJson.error) {
    toast.error(resultJson.message);
  }
  // yield call(getSettings);
}

function* saveWebUISettings(action) {
  yield put(saveWebUISettingsAction(action.payload));
  const webUISettings = Object.assign(
    {},
    yield select((state: RootState) => state.webuiSettings.v3),
    action.payload,
  );
  const newSettings = JSON.stringify(webUISettings);
  yield put({ type: Events.SETTINGS_SAVE_SERVER, payload: { context: 'WebUI_Settings', newSettings } });
}

function* togglePinnedAction(action) {
  const { payload } = action;
  const pinnedActions = yield select((state: RootState) => state.webuiSettings.v3.actions);
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
  aniDBTest,
  getPlexLoginUrl,
  getSettings,
  getTraktCode,
  saveLayout,
  saveSettings,
  saveWebUISettings,
  togglePinnedAction,
};
