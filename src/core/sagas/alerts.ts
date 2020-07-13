import { put, delay } from 'redux-saga/effects';
import { without } from 'lodash';

import QUEUE_GLOBAL_ALERT from '../events';
import { setGlobalAlert } from '../slices/globalAlert';

const maxAlerts = 2;
const alertDisplayTime = 3000;
let activeAlerts: Array<any> = [];

function* queueGlobalAlert(action) {
  const alert = action.payload;

  if (activeAlerts.length < maxAlerts) {
    activeAlerts = [...activeAlerts, alert];
    yield put(setGlobalAlert(activeAlerts));
    yield delay(alert.duration || alertDisplayTime);
    activeAlerts = without(activeAlerts, alert);
    yield put(setGlobalAlert(activeAlerts));
  } else {
    yield delay(alertDisplayTime / 2);
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: alert });
  }
}
export default {
  queueGlobalAlert,
};
