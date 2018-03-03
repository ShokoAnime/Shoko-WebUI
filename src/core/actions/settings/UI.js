// @flow
import { createAction } from 'redux-actions';

export const SET_THEME = 'SETTINGS_SET_THEME';
export const setTheme = createAction(SET_THEME);
export const SET_NOTIFICATIONS = 'SETTINGS_SET_NOTIFICATIONS';
export const setNotifications = createAction(SET_NOTIFICATIONS);
