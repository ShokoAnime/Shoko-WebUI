// @flow
import { handleAction } from 'redux-actions';
import { GET_LOG } from '../../actions/settings/Log';

export const logs = handleAction(
  GET_LOG,
  (state, action) => Object.assign({}, state, action.payload), {},
);

export default {};
