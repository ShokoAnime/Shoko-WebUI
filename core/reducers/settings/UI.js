import { combineReducers } from 'redux';
import { handleAction } from 'redux-actions';
import { SET_THEME, SET_NOTIFICATIONS } from '../../actions/settings/UI';

const theme = handleAction(SET_THEME,
  (state, action) => (action.error ? state : (action.payload || ''))
, 'light');

const notifications = handleAction(SET_NOTIFICATIONS,
  (state, action) => (action.error ? state : (!!action.payload || false))
  , true);

export default combineReducers({
  theme,
  notifications,
});
