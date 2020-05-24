import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import { createStore, applyMiddleware, Store as ReduxStore } from 'redux';

import createSagaMiddleware from 'redux-saga';
import { throttle } from 'lodash';
import { routerMiddleware } from 'connected-react-router';
import signalrMiddleware from './middlewares/signalr';
import { saveState, loadState } from './localStorage';
import createRootReducer from './reducers';
import rootSaga from './sagas';
import history from './history';


import { Action } from './actions';

// type ExtractFunctionReturn = <V>(v: (...args: any) => V) => V;
export type State = any;
// export type State2 = {
//   [P in keyof Reducers]: ExtractFunctionReturn
// };

const sagaMiddleware = createSagaMiddleware();
const routeMiddleware = routerMiddleware(history);
const middleware = [routeMiddleware, sagaMiddleware, signalrMiddleware, thunkMiddleware];

function configureStore(): ReduxStore<State, Action> {
  return createStore(
    createRootReducer(history),
    loadState(),
    process.env.NODE_ENV !== 'production' ? composeWithDevTools(applyMiddleware(...middleware)) : applyMiddleware(...middleware),
  );
}

const store = configureStore();

store.subscribe(throttle(() => {
  saveState(store.getState());
}, 1000));

sagaMiddleware.run(rootSaga);

export default store;
