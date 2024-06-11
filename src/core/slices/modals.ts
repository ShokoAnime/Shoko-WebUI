import { combineReducers } from '@reduxjs/toolkit';

import browseFolderReducer from './modals/browseFolder';
import editGroupReducer from './modals/editGroup';
import editSeriesReducer from './modals/editSeries';
import importFolderReducer from './modals/importFolder';
import profileReducer from './modals/profile';

export default combineReducers({
  browseFolder: browseFolderReducer,
  importFolder: importFolderReducer,
  profile: profileReducer,
  editSeries: editSeriesReducer,
  editGroup: editGroupReducer,
});
