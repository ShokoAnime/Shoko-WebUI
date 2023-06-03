import { combineReducers } from '@reduxjs/toolkit';

import browseFolderReducer from './modals/browseFolder';
import importFolderReducer from './modals/importFolder';
import profileReducer from './modals/profile';
import filtersReducer from './modals/filters';

export default combineReducers({
  browseFolder: browseFolderReducer,
  importFolder: importFolderReducer,
  profile: profileReducer,
  filters: filtersReducer,
});
