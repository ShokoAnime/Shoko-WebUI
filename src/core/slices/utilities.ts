import { combineReducers } from '@reduxjs/toolkit';

import airingScheduleReducer from './utilities/airingSchedule';
import avdumpReducer from './utilities/avdump';
import renamerReducer from './utilities/renamer';

export default combineReducers({
  airingSchedule: airingScheduleReducer,
  avdump: avdumpReducer,
  renamer: renamerReducer,
});
