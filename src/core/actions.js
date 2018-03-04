// @flow
import 'isomorphic-fetch';
import { createAction } from 'redux-actions';

export type Action = {
  type: string,
  payload: any
}

/* Sync actions */
export const API_SESSION = 'API_SESSION';
export const apiSession = createAction(API_SESSION);
export const SIDEBAR_TOGGLE = 'SIDEBAR_TOGGLE';
export const toggleSidebar = createAction(SIDEBAR_TOGGLE);
export const SELECT_IMPORT_FOLDER_SERIES = 'SELECT_IMPORT_FOLDER_SERIES';
export const selectImportFolderSeries = createAction(SELECT_IMPORT_FOLDER_SERIES);
export const GLOBAL_ALERT = 'GLOBAL_ALERT';
export const QUEUE_GLOBAL_ALERT = 'QUEUE_GLOBAL_ALERT';
export const SHOW_GLOBAL_ALERT = 'SHOW_GLOBAL_ALERT';
export const setGlobalAlert = createAction(QUEUE_GLOBAL_ALERT);
export const LOGOUT = 'LOGOUT';
export const SET_FETCHING = 'SET_FETCHING';


/* Async actions - API calls */
export const QUEUE_STATUS = 'QUEUE_STATUS';
export const RECENT_FILES = 'RECENT_FILES';
export const JMM_NEWS = 'JMM_NEWS';
export const IMPORT_FOLDERS = 'IMPORT_FOLDERS';
export const SERIES_COUNT = 'SERIES_COUNT';
export const FILES_COUNT = 'FILES_COUNT';
export const UPDATE_AVAILABLE = 'UPDATE_AVAILABLE';
export const WEBUI_VERSION_UPDATE = 'WEBUI_VERSION_UPDATE';
export const JMM_VERSION = 'JMM_VERSION';
export const IMPORT_FOLDER_SERIES = 'IMPORT_FOLDER_SERIES';
export const importFolderSeries = createAction(IMPORT_FOLDER_SERIES);
export const updateWebui = createAction(WEBUI_VERSION_UPDATE, payload => ({ items: payload }));


/* Timer */

export const SET_AUTOUPDATE = 'SET_AUTOUPDATE';
