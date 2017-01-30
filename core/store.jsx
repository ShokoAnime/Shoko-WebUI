import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import rootReducer from './reducers';
import rootSaga from './sagas';

const sagaMiddleware = createSagaMiddleware();
let middleware = [sagaMiddleware, thunkMiddleware];
if (process.env.NODE_ENV !== 'production') {
  middleware = [...middleware, createLogger()];
}

const store = createStore(
  rootReducer,
  applyMiddleware(...middleware),
);

sagaMiddleware.run(rootSaga);

export default store;
