import { combineReducers } from 'redux';
import { handleAction } from 'redux-actions';
import { SET_FORM_DATA, API_ADD_FOLDER, API_EDIT_FOLDER } from '../../actions/settings/ImportFolder';

const addFolder = handleAction(
  API_ADD_FOLDER, (state, action) => Object.assign({}, state, action.payload), {},
);

const editFolder = handleAction(
  API_EDIT_FOLDER, (state, action) => Object.assign({}, state, action.payload), {},
);

const defaultFormData = {
  ID: undefined,
  WatchForNewFiles: false,
  DropFolderType: 0,
  Path: '',
  Name: '',
};

const form = handleAction(
  SET_FORM_DATA, (state, action) =>
    (action.error ? state : Object.assign({}, state, action.payload || defaultFormData)),
  defaultFormData,
);

export default combineReducers({
  addFolder,
  editFolder,
  form,
});
