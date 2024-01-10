import { combineReducers } from '@reduxjs/toolkit';

import apiSessionReducer from './slices/apiSession';
import collectionReducer from './slices/collection';
import fetchingReducer from './slices/fetching';
import firstrunReducer from './slices/firstrun';
import mainpageReducer from './slices/mainpage';
import miscReducer from './slices/misc';
import modalsReducer from './slices/modals';
import utilitiesReducer from './slices/utilities';

import type { MainpageActionTypes } from './slices/mainpage';
import type { AvdumpActionTypes } from '@/core/slices/utilities/avdump';

const reducers = combineReducers({
  apiSession: apiSessionReducer,
  collection: collectionReducer,
  fetching: fetchingReducer,
  firstrun: firstrunReducer,
  mainpage: mainpageReducer,
  misc: miscReducer,
  modals: modalsReducer,
  utilities: utilitiesReducer,
});

export type ActionTypes = MainpageActionTypes | AvdumpActionTypes;
export type DispatchType = (arg0: ActionTypes) => void;

export default reducers;
