import { combineReducers } from 'redux';
import { handleAction } from 'redux-actions';
import { createApiReducer } from '../../reducers';
import { SET_STATUS, API_ADD_FOLDER } from '../../actions/modals/ImportFolder';

export const status = handleAction(SET_STATUS,
  (state, action) => (action.error ? state : action.payload)
  , false);

const addFolder = createApiReducer(API_ADD_FOLDER);

export default combineReducers({
  status,
  addFolder,
});
