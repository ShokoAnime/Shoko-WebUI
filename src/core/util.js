// @flow
import Version from '../../public/version.json';
import {
  STATUS_INVALIDATE,
  STATUS_RECEIVE,
  STATUS_REQUEST,
} from './actions';

export function createApiReducer(type, dataPropName = 'items', dataPropValue = {}, valueFn = undefined) {
  let valueFunc = null;
  if (valueFn === undefined) {
    valueFunc = value => value;
  } else {
    valueFunc = valueFn;
  }
  return (state = {
    isFetching: false,
    didInvalidate: true,
    [dataPropName]: dataPropValue,
  }, action) => {
    if (action.type !== type) {
      return state;
    }
    switch (action.meta.status) {
      case STATUS_INVALIDATE:
        return Object.assign({}, state, {
          didInvalidate: true,
        });
      case STATUS_REQUEST:
        return Object.assign({}, state, {
          isFetching: true,
          didInvalidate: false,
        });
      case STATUS_RECEIVE:
        return Object.assign({}, state, {
          isFetching: false,
          didInvalidate: false,
          [dataPropName]: valueFunc(action.payload),
          lastUpdated: action.meta.receivedAt,
        });
      default:
        return state;
    }
  };
}

export function apiReducer(state, action) {
  return action.error ? state : Object.assign({}, state, action.payload);
}

export function uiVersion() {
  return Version.debug ? Version.git : Version.package; // eslint-disable-line no-undef
}

export default { createApiReducer, apiReducer };
