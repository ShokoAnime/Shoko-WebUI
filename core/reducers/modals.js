import { combineReducers } from 'redux';
import importFolder from './modals/ImportFolder';
import browseFolder from './modals/BrowseFolder';

export default combineReducers({
  importFolder,
  browseFolder,
});
