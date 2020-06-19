import { createAction } from 'redux-actions';

export const SETTINGS_API_GET = 'SETTINGS_API_GET';
export const getSettings = createAction(SETTINGS_API_GET);
