import { combineReducers } from '@reduxjs/toolkit';

import browseFolderReducer from './modals/browseFolder';
import profileReducer from './modals/profile';

export default combineReducers({
  browseFolder: browseFolderReducer,
  profile: profileReducer,
});
