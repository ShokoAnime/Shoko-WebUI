import { combineReducers } from '@reduxjs/toolkit';

import unrecognizedReducer from './utilities/unrecognized';
import avdumpReducer from './utilities/avdump';

export default combineReducers({
  avdump: avdumpReducer,
  unrecognized: unrecognizedReducer,
});
