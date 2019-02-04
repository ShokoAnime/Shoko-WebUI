// @flow
import type { Saga } from 'redux-saga';
import { put, delay } from 'redux-saga/effects';
import { without } from 'lodash';
import { GLOBAL_ALERT, SHOW_GLOBAL_ALERT } from '../actions';
import type { Action } from '../actions';

const maxAlerts = 2;
const alertDisplayTime = 3000;
let activeAlerts = [];

export default function* alertScheduler(action: Action): Saga<void> {
  const alert = action.payload;
  if (activeAlerts.length < maxAlerts) {
    activeAlerts = [...activeAlerts, alert];
    yield put({ type: GLOBAL_ALERT, payload: activeAlerts });
    yield delay(alert.duration || alertDisplayTime);
    activeAlerts = without(activeAlerts, alert);
    yield put({ type: GLOBAL_ALERT, payload: activeAlerts });
  } else {
    yield delay(alertDisplayTime / 2);
    yield put({ type: SHOW_GLOBAL_ALERT, payload: alert });
  }
}
