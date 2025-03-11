import { combineReducers } from '@reduxjs/toolkit';

import browseFolderReducer from './modals/browseFolder';
import editGroupReducer from './modals/editGroup';
import editSeriesReducer from './modals/editSeries';
import managedFolderReducer from './modals/managedFolder';
import profileReducer from './modals/profile';

export default combineReducers({
  browseFolder: browseFolderReducer,
  managedFolder: managedFolderReducer,
  profile: profileReducer,
  editSeries: editSeriesReducer,
  editGroup: editGroupReducer,
});
