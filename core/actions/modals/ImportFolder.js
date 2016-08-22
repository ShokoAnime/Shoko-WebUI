import { createAction } from 'redux-actions';
import { createAsyncPostAction } from '../../actions';

export const SET_STATUS = 'MODALS_IMPORT_FOLDER_SET_STATUS';
export const setStatus = createAction(SET_STATUS);

export const SET_FORM_DATA = 'MODALS_IMPORT_FOLDER_SET_FORM_DATA';
export const setFormData = createAction(SET_FORM_DATA);

export const API_ADD_FOLDER = 'MODALS_IMPORT_FOLDER_API_ADD_FOLDER';
export const addFolderAsync = createAsyncPostAction(API_ADD_FOLDER, 'addFolder', '/folder/add');

export const API_EDIT_FOLDER = 'MODALS_IMPORT_FOLDER_API_EDIT_FOLDER';
export const editFolderAsync = createAsyncPostAction(API_EDIT_FOLDER, 'editFolder', '/folder/edit',
  (response) => {
    if (response.ok === true) {
      return { status: true };
    }
    return { status: false, message: response.status };
  }
);
