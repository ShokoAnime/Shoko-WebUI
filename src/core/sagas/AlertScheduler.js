import { delay } from 'redux-saga';
import { put, call } from 'redux-saga/effects';
import { without } from 'lodash/array';
import { GLOBAL_ALERT, SHOW_GLOBAL_ALERT } from '../actions';

const maxAlerts = 2;
const alertDisplayTime = 3000;
let activeAlerts = [];

export default function* alertScheduler(action) {
  const alert = action.payload;
  if (activeAlerts.length < maxAlerts) {
    activeAlerts = [...activeAlerts, alert];
    yield put({ type: GLOBAL_ALERT, payload: activeAlerts });
    yield call(delay, alertDisplayTime);
    activeAlerts = without(activeAlerts, alert);
    yield put({ type: GLOBAL_ALERT, payload: activeAlerts });
  } else {
    yield call(delay, alertDisplayTime / 2);
    yield put({ type: SHOW_GLOBAL_ALERT, payload: alert });
  }
}
