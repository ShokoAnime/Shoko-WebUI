import { createAction } from 'redux-actions';
import { createAsyncAction } from '../../actions';

export const SET_STATUS = 'MODALS_IMPORT_FOLDER_SET_STATUS';
export const setStatus = createAction(SET_STATUS);

export const API_ADD_FOLDER = 'MODALS_IMPORT_FOLDER_API_ADD_FOLDER';
export const addFolderAsync = createAsyncAction(API_ADD_FOLDER, 'addFolder', '/import/folder');
