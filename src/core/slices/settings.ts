import { combineReducers } from '@reduxjs/toolkit';

import releaseReducer from './settings/release';

export default combineReducers({
  release: releaseReducer,
});
