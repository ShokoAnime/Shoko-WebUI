// @flow
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import throttle from 'lodash/throttle';
import { routerMiddleware } from 'react-router-redux';
import { saveState, loadState } from './localStorage';
import rootReducer from './reducers';
import rootSaga from './sagas';
import history from './history';

const sagaMiddleware = createSagaMiddleware();
const routeMiddleware = routerMiddleware(history);
let middleware = [routeMiddleware, sagaMiddleware, thunkMiddleware];
if (process.env.NODE_ENV !== 'production') {
  middleware = [...middleware, createLogger()];
}

const store = createStore(
  rootReducer,
  loadState(),
  applyMiddleware(...middleware),
);

store.subscribe(throttle(() => {
  saveState({
    apiSession: store.getState().apiSession,
  });
}, 1000));

sagaMiddleware.run(rootSaga);

export default store;
