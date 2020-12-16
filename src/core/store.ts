import createSagaMiddleware from 'redux-saga';
import { throttle } from 'lodash';
import { routerMiddleware } from 'connected-react-router';
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import signalrMiddleware from './middlewares/signalr';
import { saveState, loadState } from './localStorage';
import createRootReducer from './reducers';
import rootSaga from './sagas';
import history from './history';
import Events from './events';

const combinedReducer = createRootReducer(history);
const rootReducer = (state, action) => {
  if (action.type === Events.STORE_CLEAR_STATE) { // check for action type
    // eslint-disable-next-line no-param-reassign
    state = {} as any;
  }
  return combinedReducer(state, action);
};

export type RootState = ReturnType<typeof rootReducer>;

const sagaMiddleware = createSagaMiddleware();
const routeMiddleware = routerMiddleware(history);
const middleware = [...getDefaultMiddleware(), routeMiddleware, sagaMiddleware, signalrMiddleware];

const store = configureStore({
  reducer: rootReducer,
  middleware,
  preloadedState: loadState(),
  devTools: process.env.NODE_ENV !== 'production',
});

store.subscribe(throttle(() => {
  saveState(store.getState());
}, 1000));

sagaMiddleware.run(rootSaga);

export default store;
