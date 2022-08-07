import { combineReducers } from '@reduxjs/toolkit';

import browseFolderReducer from './modals/browseFolder';
import importFolderReducer from './modals/importFolder';
import languagesReducer from './modals/languages';
import profileReducer from './modals/profile';
import filtersReducer from './modals/filters';

export default combineReducers({
  browseFolder: browseFolderReducer,
  importFolder: importFolderReducer,
  languages: languagesReducer,
  profile: profileReducer,
  filters: filtersReducer,
});
