// @flow
import { combineReducers } from 'redux';
import importFolder from './modals/ImportFolder';
import browseFolder from './modals/BrowseFolder';
import quickActions from './modals/QuickActions';
import changePassword from './modals/ChangePassword';

export default combineReducers({
  importFolder,
  browseFolder,
  quickActions,
  changePassword
});
