import { combineReducers } from '@reduxjs/toolkit';

import avdumpReducer from './utilities/avdump';
import renamerReducer from './utilities/renamer';

export default combineReducers({
  avdump: avdumpReducer,
  renamer: renamerReducer,
});
