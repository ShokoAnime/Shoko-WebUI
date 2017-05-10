// @flow
import { combineReducers } from 'redux';
import { handleAction } from 'redux-actions';
import { SET_LOG_DELTA, SET_UPDATE_CHANNEL } from '../../actions/settings/Other';

const updateChannel = handleAction(
  SET_UPDATE_CHANNEL,
  (state, action) => (action.error ? state : (action.payload || ''))
  , 'stable',
);

const logDelta = handleAction(
  SET_LOG_DELTA,
  (state, action) => (action.error ? state : (parseInt(action.payload, 10) || state))
  , 100,
);

export default combineReducers({
  updateChannel,
  logDelta,
});
