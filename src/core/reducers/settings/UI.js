// @flow
import { combineReducers } from 'redux';
import { handleAction } from 'redux-actions';
import { SET_THEME, SET_NOTIFICATIONS } from '../../actions/settings/UI';
import type { Action } from '../../actions';

type themeType = 'light' | 'dark' | 'custom';

const themeDefault = 'light';
const theme = handleAction(
  SET_THEME,
  (state: themeType, action: Action): themeType => {
    if (!action) { return state; }
    return action.payload || themeDefault;
  },
  themeDefault,
);

const notifications = handleAction(
  SET_NOTIFICATIONS,
  (state: boolean, action: Action): boolean => {
    if (!action) { return state; }
    return !!action.payload || false;
  },
  true,
);

export default combineReducers({
  theme,
  notifications,
});
