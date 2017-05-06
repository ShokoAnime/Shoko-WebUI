import { handleAction } from 'redux-actions';
import { createApiReducer } from '../../util';
import { GET_LOG, SET_LOG } from '../../actions/settings/Log';

export const logs = handleAction(GET_LOG,
  (state, action) => Object.assign({}, state, action.payload)
  , {});
export const setLogs = createApiReducer(SET_LOG);
