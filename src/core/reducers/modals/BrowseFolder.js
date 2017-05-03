import { combineReducers } from 'redux';
import { handleAction } from 'redux-actions';
import { SET_STATUS, SET_FOLDER } from '../../actions/modals/BrowseFolder';

export const status = handleAction(SET_STATUS,
  (state, action) => (action.error ? state : action.payload)
  , false);
export const folder = handleAction(SET_FOLDER,
  (state, action) => (action.error ? state : action.payload)
  , false);

export default combineReducers({
  status,
  folder,
});
