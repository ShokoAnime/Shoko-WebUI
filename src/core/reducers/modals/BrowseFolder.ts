import { combineReducers } from 'redux';
import { handleAction } from 'redux-actions';
import {
  SET_STATUS, SET_FOLDER, SET_ID, SET_ITEMS, SET_SELECTED_NODE,
} from '../../actions/modals/BrowseFolder';

export const status = handleAction(
  SET_STATUS,
  (state, action) => (action.error ? state : action.payload), false,
);
export const folder = handleAction(
  SET_FOLDER,
  (state, action) => (action.error ? state : action.payload), false,
);
export const id = handleAction(
  SET_ID,
  (state, action) => (action.error ? state : action.payload), false,
);
export const items = handleAction(
  SET_ITEMS,
  (state, action) => {
    const { key, nodes } = action.payload as any;
    return Object.assign({}, state, { [key]: nodes });
  }, {},
);
export const selectedNode = handleAction(
  SET_SELECTED_NODE,
  (state, action) => (action.error ? state : Object.assign({}, state, action.payload)), {},
);

export default combineReducers({
  status,
  folder,
  items,
  id,
  selectedNode,
});
