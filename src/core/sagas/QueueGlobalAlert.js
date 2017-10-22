import { put } from 'redux-saga/effects';

import { SHOW_GLOBAL_ALERT } from '../actions';

export default function* queueGlobalAlert(action) {
  yield put({ type: SHOW_GLOBAL_ALERT, payload: action.payload });
}
