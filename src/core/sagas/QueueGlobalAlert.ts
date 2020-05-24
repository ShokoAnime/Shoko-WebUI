
import { put } from 'redux-saga/effects';
import { Action, SHOW_GLOBAL_ALERT } from '../actions';


export default function* queueGlobalAlert(action: Action) {
  yield put({ type: SHOW_GLOBAL_ALERT, payload: action.payload });
}
