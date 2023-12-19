import { combineReducers } from '@reduxjs/toolkit';

import apiSessionReducer from './slices/apiSession';
import collectionReducer from './slices/collection';
import fetchingReducer from './slices/fetching';
import firstrunReducer from './slices/firstrun';
import mainpageReducer from './slices/mainpage';
import miscReducer from './slices/misc';
import modalsReducer from './slices/modals';
import utilitiesReducer from './slices/utilities';

const reducers = combineReducers({
  apiSession: apiSessionReducer,
  fetching: fetchingReducer,
  firstrun: firstrunReducer,
  mainpage: mainpageReducer,
  misc: miscReducer,
  modals: modalsReducer,
  collection: collectionReducer,
  utilities: utilitiesReducer,
});

export default reducers;
