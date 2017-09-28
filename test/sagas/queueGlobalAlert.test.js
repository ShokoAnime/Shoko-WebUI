import sagaHelper from 'redux-saga-testing';
import { put } from 'redux-saga/effects';
import avaTest from 'ava';
import { SHOW_GLOBAL_ALERT } from '../../src/core/actions';

import queueGlobalAlert from '../../src/core/sagas/QueueGlobalAlert';

const action = { payload: 'test payload' };

const testResult = put({ type: SHOW_GLOBAL_ALERT, payload: action.payload });

const test = sagaHelper(queueGlobalAlert(action), avaTest);

test('should return put effect with payload', (result, t) => {
  t.deepEqual(result, testResult);
});
