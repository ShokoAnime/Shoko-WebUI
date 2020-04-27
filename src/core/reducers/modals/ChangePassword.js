// @flow
import { combineReducers } from 'redux';
import { handleAction } from 'redux-actions';
import { SET_STATUS } from '../../actions/modals/ChangePassword';

const status = handleAction(
  SET_STATUS,
  (state, action) => (action.error ? state : action.payload),
  false,
);

export default combineReducers({
  status,
});
