import { combineReducers } from '@reduxjs/toolkit';

import unrecognizedReducer from './utilities/unrecognized';

export default combineReducers({
  unrecongnized: unrecognizedReducer,
});