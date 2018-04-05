// @flow
import { combineReducers } from 'redux';
import { handleAction } from 'redux-actions';
import { SET_THEME, SET_NOTIFICATIONS } from '../../actions/settings/UI';
import type { Action } from '../../actions';

type themeType = 'light' | 'dark' | 'custom';

export const theme = handleAction(
  SET_THEME,
  (state: themeType, action: Action): themeType => {
    if (!action.payload) { return state; }
    return action.payload;
  },
  'light',
);

export const notifications = handleAction(
  SET_NOTIFICATIONS,
  (state: boolean, action: Action): boolean => {
    if (!action.payload) { return state; }
    return !!action.payload;
  },
  true,
);

export default combineReducers({
  theme,
  notifications,
});
