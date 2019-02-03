// @flow
import { combineReducers } from 'redux';
import { handleAction } from 'redux-actions';
import {
  SET_STATUS, SET_ACTION,
} from '../../actions/modals/QuickActions';

const status = handleAction(
  SET_STATUS,
  (state, action) => (action.error ? state : action.payload), false,
);

const actionProp = handleAction(
  SET_ACTION,
  (state, action) => (action.error ? state : action.payload), '',
);

export default combineReducers({
  status,
  action: actionProp,
});
