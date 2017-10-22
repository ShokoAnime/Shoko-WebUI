import sagaHelper from 'redux-saga-testing';
import avaTest from 'ava';
import { put, call } from 'redux-saga/effects';
import { delay } from 'redux-saga';
import { GLOBAL_ALERT } from '../../src/core/actions';

import saga from '../../src/core/sagas/AlertScheduler';

const alertDisplayTime = 3000;
const action = { payload: 'test payload' };

const test = sagaHelper(saga(action), avaTest);

const testResult = put({ type: GLOBAL_ALERT, payload: [action.payload] });

test('should return put GLOBAL_ALERT', (result, t) => {
  t.deepEqual(result, testResult);
});

test('should return delay', (result, t) => {
  t.deepEqual(result, call(delay, alertDisplayTime));
});

test('should return empty GLOBAL_ALERT', (result, t) => {
  t.deepEqual(result, put({ type: GLOBAL_ALERT, payload: [] }));
});
