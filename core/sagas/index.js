import { delay } from 'redux-saga';
import { put, takeEvery, call } from 'redux-saga/effects';
import { without } from 'lodash/array';
import { forEach } from 'lodash';
import Api from '../api';
import { QUEUE_GLOBAL_ALERT, SHOW_GLOBAL_ALERT, GLOBAL_ALERT } from '../actions';
import { GET_DELTA } from '../actions/logs/Delta';
import { SET_CONTENTS, APPEND_CONTENTS } from '../actions/logs/Contents';

// TODO: separate into submodules, for now we just put all sagas in one file

/* ALERT SYSTEM */
const maxAlerts = 2;
const alertDisplayTime = 3000;
let activeAlerts = [];

function* alertScheduler(action) {
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

function* queueGlobalAlert(action) {
  yield put({ type: SHOW_GLOBAL_ALERT, payload: action.payload });
}
/* ALERT SYSTEM */

/**
 * Fetches more log lines from server
 */
function splitLogLines(json) {
  const lines = [];
  let currentLine = null;
  const logRegex = /^\[([0-9-]+\s{1}[0-9:]+)]\s(\w+)\|(.*)/g;

  try {
    forEach(json.lines, (line) => {
      logRegex.lastIndex = 0;
      const tags = logRegex.exec(line);
      if (tags !== null) {
        if (currentLine !== null) {
          lines.push(currentLine);
        }
        currentLine = Object.assign({}, {
          stamp: tags[1],
          tag: tags[2],
          text: tags[3],
        });
      } else {
        if (currentLine === null) {
          currentLine = Object.assign({}, {
            stamp: null,
            tag: null,
            text: tags !== null ? line : '',
          });
        }
        currentLine.text += line;
      }
    });
    if (currentLine !== null) {
      lines.push(currentLine);
    }

    return { data: lines };
  } catch (ex) {
    return { error: true, message: ex.message };
  }
}

function* getLogDelta(action) {
  const resultJson = yield call(Api.getLogDelta, action.payload);

  if (resultJson.error) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: resultJson.message });
    return;
  }

  const result = splitLogLines(resultJson.data);
  if (result.error) {
    yield put({ type: QUEUE_GLOBAL_ALERT, payload: result.message });
    return;
  }

  yield put({
    type: action.payload ? APPEND_CONTENTS : SET_CONTENTS,
    payload: { lines: result.data },
  });
}

export default function* rootSaga() {
  yield [
    takeEvery(QUEUE_GLOBAL_ALERT, queueGlobalAlert),
    takeEvery(SHOW_GLOBAL_ALERT, alertScheduler),
    takeEvery(GET_DELTA, getLogDelta),
  ];
}
