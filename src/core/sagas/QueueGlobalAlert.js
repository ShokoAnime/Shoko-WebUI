// @flow
import { put } from 'redux-saga/effects';
import type { Saga } from 'redux-saga';
import type { Action } from '../actions';

import { SHOW_GLOBAL_ALERT } from '../actions';

export default function* queueGlobalAlert(action: Action): Saga<void> {
  yield put({ type: SHOW_GLOBAL_ALERT, payload: action.payload });
}
