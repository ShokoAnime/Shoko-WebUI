// @flow
import { call, put, select } from 'redux-saga/effects';
import Ajv from 'ajv';
import type { Saga } from 'redux-saga';
import { QUEUE_GLOBAL_ALERT } from '../actions';
import Api from '../api';
import type { Action } from '../actions';
import type { State } from '../store';

export const settingsSelector = (state: State) => state.settings;

function* settingsSaveWebui(action: Action): Saga<void> {
  const settings = yield select(settingsSelector);
  const currentSettings = {
    uiTheme: settings.ui.theme,
    uiNotifications: settings.ui.notifications,
    otherUpdateChannel: settings.other.updateChannel,
    logDelta: settings.other.logDelta,
  };
  const data = { ...currentSettings, ...action.payload };

  const schema = {
    type: 'object',
    required: ['uiTheme', 'uiNotifications', 'otherUpdateChannel', 'logDelta'],
    properties: {
      uiTheme: { enum: ['light', 'dark', 'custom'] },
      uiNotifications: { type: 'boolean' },
      otherUpdateChannel: { enum: ['stable', 'unstable'] },
      logDelta: { type: 'integer', minimum: 1, maximum: 1000 },
    },
  };
  // $FlowFixMe
  const ajv = new Ajv();
  const validator = ajv.compile(schema);
  const result = validator(data);
  if (result !== true) {
    yield put({
      type: QUEUE_GLOBAL_ALERT,
      payload: { type: 'error', text: 'Schema validation failed!' },
    });
    return;
  }

  const resultJson = yield call(Api.postWebuiConfig, data);
  if (resultJson.error) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
  } else {
    yield put({
      type: QUEUE_GLOBAL_ALERT,
      payload: { type: 'success', text: 'WebUI settings saved!' },
    });
  }
}

export default {
  saveWebui: settingsSaveWebui,
};
