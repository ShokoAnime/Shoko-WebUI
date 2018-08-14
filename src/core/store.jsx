// @flow
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { createStore, applyMiddleware } from 'redux';
import type { Store as ReduxStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import throttle from 'lodash/throttle';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { saveState, loadState } from './localStorage';
import rootReducer from './reducers';
import rootSaga from './sagas';
import history from './history';

import type { Reducers } from './reducers';
import type { Action } from './actions';

type $ExtractFunctionReturn = <V>(v: (...args: any) => V) => V;
export type State = $ObjMap<Reducers, $ExtractFunctionReturn>;

const sagaMiddleware = createSagaMiddleware();
const routeMiddleware = routerMiddleware(history);
let middleware = [routeMiddleware, sagaMiddleware, thunkMiddleware];
if (process.env.NODE_ENV !== 'production') {
  middleware = [...middleware, createLogger()];
}

function configureStore(): ReduxStore<State, Action> {
  return createStore(
    connectRouter(history)(rootReducer),
    loadState(),
    applyMiddleware(...middleware),
  );
}

const store = configureStore();

store.subscribe(throttle(() => {
  saveState(store.getState());
}, 1000));

sagaMiddleware.run(rootSaga);

export default store;
