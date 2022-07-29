import { combineReducers } from '@reduxjs/toolkit';

import logsReducer from './logs';

export default combineReducers({
  logs: logsReducer,
});
