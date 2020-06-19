import { createAction } from 'redux-actions';

export const SET_STATUS = 'MODALS_BROWSE_FOLDER_SET_STATUS';
export const setStatus = createAction(SET_STATUS);
export const SET_FOLDER = 'MODALS_BROWSE_FOLDER_SET_FOLDER';
export const setFolder = createAction(SET_FOLDER);
export const SET_ID = 'MODALS_BROWSE_FOLDER_SET_ID';
export const setId = createAction(SET_ID);
export const SET_ITEMS = 'MODALS_BROWSE_FOLDER_SET_ITEMS';
export const setItems = createAction(SET_ITEMS);
export const SET_SELECTED_NODE = 'MODALS_BROWSE_FOLDER_SET_SELECTED_NODE';
export const setSelectedItems = createAction(SET_SELECTED_NODE);
