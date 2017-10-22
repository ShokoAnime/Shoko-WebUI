import { delay } from 'redux-saga';
import { take, cancel, fork, call, put } from 'redux-saga/effects';
import Api from '../api';
import Events from '../events';
import { QUEUE_GLOBAL_ALERT } from '../actions';
import { getStatus } from '../actions/firstrun';

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

const typeMap = {
  'server-status': pollServerStatus,
};

export default function* apiPollingDriver(action) {
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
