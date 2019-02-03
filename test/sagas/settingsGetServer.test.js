import { call, put } from 'redux-saga/effects';
import { cloneableGenerator } from 'redux-saga/utils';
import proxyquire from 'proxyquire';
import test from 'ava';
import { QUEUE_GLOBAL_ALERT } from '../../src/core/actions';
import { settingsServer } from '../../src/core/actions/settings/Server';

const mockApi = {
  configExport: () => ({}),
  '@noCallThru': true,
};

const settingsSagas = proxyquire('../../src/core/sagas/settings', {
  '../api/common': mockApi,
});

test('settingsGetServer', (t) => {
  const generator = cloneableGenerator(settingsSagas.default.getServer)();
  const effectCall = call(mockApi.configExport);
  t.deepEqual(effectCall, generator.next().value, 'call effect with Api.configExport');

  const cloneError = generator.clone();
  const responseError = { error: true, message: 'Test error' };
  const effectPutError = put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: responseError.message } });
  t.deepEqual(effectPutError, cloneError.next(responseError).value, 'put effect with error message');
  t.true(cloneError.next().done, 'should be done');

  const cloneSuccess = generator.clone();
  const responseSuccess = { data: 'Test data' };
  const effectPut = put(settingsServer(responseSuccess.data));
  t.deepEqual(effectPut, cloneSuccess.next(responseSuccess).value, 'put effect with settingsServer');
  t.true(cloneSuccess.next().done, 'should be done');
});
