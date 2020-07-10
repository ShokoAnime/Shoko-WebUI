import { combineReducers } from '@reduxjs/toolkit';

import browseFolderReducer from './modals/browseFolder';
import importFolderReducer from './modals/importFolder';
import profileReducer from './modals/profile';

export default combineReducers({
  browseFolder: browseFolderReducer,
  importFolder: importFolderReducer,
  profile: profileReducer,
});
