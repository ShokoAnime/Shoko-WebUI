import {
  take, cancel, fork, call, put, select, cancelled, delay,
} from 'redux-saga/effects';
import { toast } from 'react-toastify';

import ApiInit from '../api/v3/init';
import ApiPlex from '../api/v3/plex';
import Events from '../events';
import { SET_AUTOUPDATE, Action } from '../actions';
import { setServerStatus } from '../slices/firstrun';
import { setItem as setMiscItem } from '../slices/misc';

function* pollServerStatus() {
  while (true) {
    const resultJson = yield call(ApiInit.getStatus.bind(this));
    if (resultJson.error) {
      toast.error(resultJson.message);
      yield put({ type: Events.STOP_API_POLLING, payload: { type: 'server-status' } });
    } else {
      yield put(setServerStatus(resultJson.data));
    }
    yield delay(100);
  }
}

function* pollAutoRefresh() {
  try {
    yield put({ type: SET_AUTOUPDATE, payload: true });
    while (true) {
      const location = yield select(state => state.router.location.pathname);

      if (location === '/main') {
        yield put({ type: Events.MAINPAGE_REFRESH, payload: null });
      }

      yield delay(1500);
    }
  } finally {
    if (yield cancelled()) {
      yield put({ type: SET_AUTOUPDATE, payload: false });
    }
  }
}

function* pollPlexAuthentication() {
  while (true) {
    const resultJson = yield call(ApiPlex.getPlexPinAuthenticated.bind(this));
    if (resultJson.error) {
      toast.error(resultJson.message);
      yield put({ type: Events.STOP_API_POLLING, payload: { type: 'plex-auth' } });
    } else {
      yield put(setServerStatus(resultJson.data));
      if (resultJson.data) {
        yield put(setMiscItem({ plex: { authenticated: true } }));
        yield put({ type: Events.STOP_API_POLLING, payload: { type: 'plex-auth' } });
      }
    }
    yield delay(1000);
  }
}

const typeMap = {
  'server-status': pollServerStatus,
  'auto-refresh': pollAutoRefresh,
  'plex-auth': pollPlexAuthentication,
};

export default function* apiPollingDriver(action: Action) {
  const {
    type,
  } = action.payload;

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
