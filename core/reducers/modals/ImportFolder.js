import { combineReducers } from 'redux';
import { handleAction } from 'redux-actions';
import { createApiReducer } from '../../reducers';
import {
  SET_STATUS,
  SET_FORM_DATA,
  API_ADD_FOLDER,
  API_EDIT_FOLDER,
} from '../../actions/modals/ImportFolder';

const status = handleAction(SET_STATUS,
  (state, action) => (action.error ? state : action.payload)
  , false);

const addFolder = createApiReducer(API_ADD_FOLDER);
const editFolder = createApiReducer(API_EDIT_FOLDER);

const defaultFormData = {
  ImportFolderID: undefined,
  ImportFolderType: '1',
  ImportFolderName: '',
  ImportFolderLocation: '',
  IsDropSource: 0,
  IsDropDestination: 0,
  IsWatched: 0,
};

const form = handleAction(SET_FORM_DATA, (state, action) =>
    (action.error ? state : Object.assign({}, state, action.payload || defaultFormData)),
  defaultFormData);

export default combineReducers({
  status,
  addFolder,
  editFolder,
  form,
});
