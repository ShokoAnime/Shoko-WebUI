import { combineReducers } from '@reduxjs/toolkit';

import avdumpReducer from './utilities/avdump';

export default combineReducers({
  avdump: avdumpReducer,
});
