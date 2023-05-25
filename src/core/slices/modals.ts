import { combineReducers } from '@reduxjs/toolkit';

import browseFolderReducer from './modals/browseFolder';
import importFolderReducer from './modals/importFolder';
import profileReducer from './modals/profile';
import filtersReducer from './modals/filters';
import actionsReducer from './modals/actions';
import utilitiesReducer from './modals/utilities';

export default combineReducers({
  browseFolder: browseFolderReducer,
  importFolder: importFolderReducer,
  profile: profileReducer,
  filters: filtersReducer,
  actions: actionsReducer,
  utilities: utilitiesReducer,
});
