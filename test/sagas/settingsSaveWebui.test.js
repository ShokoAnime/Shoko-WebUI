import { select, call, put } from 'redux-saga/effects';
import { cloneableGenerator } from 'redux-saga/utils';
import proxyquire from 'proxyquire';
import test from 'ava';
import { createStore } from 'redux';
import reducer from '../../src/core/reducers/settings';
import { QUEUE_GLOBAL_ALERT } from '../../src/core/actions';

const action = {
  payload: {
    otherUpdateChannel: 'stable',
    logDelta: 100,
  },
};

const state = createStore(reducer).getState();

const mockApi = {
  postWebuiConfig: () => ({}),
  '@noCallThru': true,
};

const settingsSagas = proxyquire('../../src/core/sagas/settings', {
  '../api': mockApi,
});

test('settingsSaveWebui', (t) => {
  const generator = cloneableGenerator(settingsSagas.default.saveWebui)(action);
  const effectSelect = select(settingsSagas.settingsSelector);
  t.deepEqual(effectSelect, generator.next().value, 'select effect with settings selector');
  t.deepEqual(state, settingsSagas.settingsSelector({ settings: state }), 'settings selector matches');

  const cloneInvalidData = generator.clone();
  const invalidState = Object.assign({}, state, { ui: { ...state.ui, theme: 'invalid' } });
  const effectPutInvalid = put({
    type: QUEUE_GLOBAL_ALERT,
    payload: { type: 'error', text: 'Schema validation failed!' },
  });
  t.deepEqual(effectPutInvalid, cloneInvalidData.next(invalidState).value, 'put effect invalid schema');

  const currentSettings = {
    uiTheme: state.ui.theme,
    uiNotifications: state.ui.notifications,
    otherUpdateChannel: state.other.updateChannel,
    logDelta: state.other.logDelta,
  };
  const data = { ...currentSettings, ...action.payload };
  const effectCall = call(mockApi.postWebuiConfig, data);
  t.deepEqual(effectCall, generator.next(state).value, 'call effect with Api.postWebuiConfig');

  const cloneError = generator.clone();
  const responseError = { error: true, message: 'Test error' };
  const effectPutError = put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: responseError.message } });
  t.deepEqual(effectPutError, cloneError.next(responseError).value, 'put effect with error message');
  t.true(cloneError.next().done, 'should be done');

  const cloneSuccess = generator.clone();
  const responseSuccess = { data: 'Test data' };
  const effectSuccess = put({
    type: QUEUE_GLOBAL_ALERT,
    payload: { type: 'success', text: 'WebUI settings saved!' },
  });
  t.deepEqual(effectSuccess, cloneSuccess.next(responseSuccess).value, 'put effect with success message');
  t.true(cloneSuccess.next().done, 'should be done');
});
