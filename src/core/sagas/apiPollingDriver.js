// @flow
import { delay } from 'redux-saga';
import type { Saga } from 'redux-saga';
import { take, cancel, fork, call, put, select, cancelled } from 'redux-saga/effects';
import Api from '../api';
import Events from '../events';
import { QUEUE_GLOBAL_ALERT, SET_AUTOUPDATE } from '../actions';
import { getStatus } from '../actions/firstrun';
import type { Action } from '../actions';
import { getDelta } from '../actions/logs/Delta';


function* pollServerStatus() {
  while (true) {
    const resultJson = yield call(Api.getInit.bind(this, 'status'));
    if (resultJson.error) {
      yield put({ type: QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    } else {
      yield put(getStatus(resultJson.data));
    }
    yield call(delay, 2000);
  }
}

function* pollAutoRefresh() {
  try {
    yield put({ type: SET_AUTOUPDATE, payload: true });
    while (true) {
      const location = yield select(state => state.router.location.pathname);

      if (location === '/dashboard') {
        yield put({ type: Events.DASHBOARD_QUEUE_STATUS, payload: null });
        yield put({ type: Events.DASHBOARD_RECENT_FILES, payload: null });
      } else if (location === '/logs') {
        const payload = yield select(state => ({
          delta: state.settings.other.logDelta,
          position: state.logs.contents.position,
        }));
        yield put(getDelta(payload));
      }

      yield call(delay, 4000);
    }
  } finally {
    if (yield cancelled()) {
      yield put({ type: SET_AUTOUPDATE, payload: false });
    }
  }
}

const typeMap = {
  'server-status': pollServerStatus,
  'auto-refresh': pollAutoRefresh,
};

export default function* apiPollingDriver(action: Action): Saga<void> {
  const { type } = action.payload;

  if (typeof typeMap[type] !== 'function') {
    return;
  }

  // starts the task in the background
  const pollApiTask = yield fork(typeMap[type]);

  // wait for the user stop action
  while (true) {
    const stopAction = yield take(Events.STOP_API_POLLING);
    const stopType = stopAction.payload.type;
    if (stopType === type) { break; }
  }

  // user clicked stop. cancel the background task
  // this will throw a SagaCancellationException into the forked bgSync task
  yield cancel(pollApiTask);
}
