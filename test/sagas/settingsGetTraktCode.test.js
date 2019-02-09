import { call, put } from 'redux-saga/effects';
import { cloneableGenerator } from '@redux-saga/testing-utils';
import proxyquire from 'proxyquire';
import test from 'ava';
import { QUEUE_GLOBAL_ALERT } from '../../src/core/actions';
import { settingsTrakt } from '../../src/core/actions/settings/Trakt';
import Events from '../../src/core/events';

const mockApi = {
  getTraktCode: () => ({}),
  '@noCallThru': true,
};

const settingsSagas = proxyquire('../../src/core/sagas/settings', {
  '../api/common': mockApi,
});

test('settingsGetTraktCode', (t) => {
  const generator = cloneableGenerator(settingsSagas.default.getTraktCode)();
  const effectPutStartFetching = put({ type: Events.START_FETCHING, payload: 'trakt_code' });
  t.deepEqual(effectPutStartFetching, generator.next().value, 'put effect with START_FETCHING');

  const effectCall = call(mockApi.getTraktCode);
  t.deepEqual(effectCall, generator.next().value, 'call effect with Api.getTraktCode');

  const effectPutStopFetching = put({ type: Events.STOP_FETCHING, payload: 'trakt_code' });
  const cloneError = generator.clone();

  const responseError = { error: true, message: 'Test error' };
  const effectPutError = put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: responseError.message } });
  t.deepEqual(effectPutStopFetching, cloneError.next(responseError).value, 'on error put effect with STOP_FETCHING');
  t.deepEqual(effectPutError, cloneError.next().value, 'put effect with error message');
  t.true(cloneError.next().done, 'should be done');

  const cloneSuccess = generator.clone();
  const responseSuccess = { data: 'Test data' };
  const effectPut = put(settingsTrakt(responseSuccess.data));
  t.deepEqual(effectPutStopFetching, cloneSuccess.next(responseSuccess).value, 'on success put effect with STOP_FETCHING');
  t.deepEqual(effectPut, cloneSuccess.next().value, 'put effect with settingsServer');
  t.true(cloneSuccess.next().done, 'should be done');
});
