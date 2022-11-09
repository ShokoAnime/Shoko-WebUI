import { combineReducers } from 'redux';
import { createRouterReducer } from '@lagunovsky/redux-react-router';
import { handleAction } from 'redux-actions';
import {
  SET_AUTOUPDATE,
} from './actions';

import apiSessionReducer from './slices/apiSession';
import fetchingReducer from './slices/fetching';
import firstrunReducer from './slices/firstrun';
import mainpageReducer from './slices/mainpage';
import miscReducer from './slices/misc';
import modalsReducer from './slices/modals';
import collectionReducer from './slices/collection';
import utilitiesReducer from './slices/utilities';

import { externalApi } from './rtkQuery/externalApi';
import { logsApi } from './rtkQuery/logsApi';
import { splitApi } from './rtkQuery/splitApi';
import { splitV3Api } from './rtkQuery/splitV3Api';

const autoUpdate = handleAction(SET_AUTOUPDATE, (state, action) => action.payload, false);

const reducers = {
  apiSession: apiSessionReducer,
  fetching: fetchingReducer,
  firstrun: firstrunReducer,
  mainpage: mainpageReducer,
  misc: miscReducer,
  modals: modalsReducer,
  autoUpdate,
  collection: collectionReducer,
  utilities: utilitiesReducer,
  [externalApi.reducerPath]: externalApi.reducer,
  [logsApi.reducerPath]: logsApi.reducer,
  [splitApi.reducerPath]: splitApi.reducer,
  [splitV3Api.reducerPath]: splitV3Api.reducer,
};

export type Reducers = typeof reducers;

export default (history => combineReducers({ router: createRouterReducer(history), ...reducers }));
