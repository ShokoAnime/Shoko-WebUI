/* eslint-disable max-len */
import {
  JsonHubProtocol, HttpTransportType, HubConnectionBuilder, LogLevel,
} from '@aspnet/signalr';
import moment from 'moment';
import {
  debounce, delay, defer, round,
} from 'lodash';

import Events from '../events';
import { setQueueStatus } from '../slices/mainpage';

let lastRetry = moment();
let attempts = 0;
const maxTimeout = 60000;

const onQueueStateChange = (dispatch, getState) => (queue, state) => {
  const newState = Object.assign({}, { [queue]: Object.assign({}, getState().mainpage.queueStatus[queue], { state }) });
  dispatch(setQueueStatus(newState));
};
const onQueueCountChange = (dispatch, getState) => (queue, count) => {
  const currentQueue = getState().mainpage.queueStatus[queue];
  if (queue === 'general' && currentQueue.count > count) dispatch({ type: Events.MAINPAGE_REFRESH });

  const newState = Object.assign({}, { [queue]: Object.assign({}, currentQueue, { count }) });
  dispatch(setQueueStatus(newState));
};
const onQueueRefreshState = dispatch => (state) => {
  dispatch(setQueueStatus(state));
};

const startSignalRConnection = connection => connection.start().then(() => {
  lastRetry = moment();
  attempts = 0;
}).catch(err => console.error('SignalR Connection Error: ', err));

const handleReconnect = (connection) => {
  if (attempts < 4) { attempts += 1; }
  const duration = moment.duration(lastRetry.diff(moment()));
  lastRetry = moment();
  const elapsed = duration.as('milliseconds');
  const timeout = round(Math.min(Math.exp(attempts) * 2000, maxTimeout));
  if (elapsed < timeout) {
    delay((conn) => { startSignalRConnection(conn); }, timeout, connection);
  } else {
    defer((conn) => { startSignalRConnection(conn); }, connection);
  }
};

const signalRMiddleware = ({
  dispatch,
  getState,
}) => next => async (action) => {
  // register signalR after the user logged in
  if (action.type === Events.MAINPAGE_LOAD) {
    const connectionHub = '/signalr/events';

    const protocol = new JsonHubProtocol();

    // let transport to fall back to to LongPolling if it needs to
    // eslint-disable-next-line no-bitwise
    const transport = HttpTransportType.WebSockets | HttpTransportType.LongPolling;

    const options = {
      transport,
      logMessageContent: true,
      logger: LogLevel.Warning,
      accessTokenFactory: () => getState().apiSession.apikey,
    };

    // create the connection instance
    const connection = new HubConnectionBuilder().withUrl(connectionHub, options).withHubProtocol(protocol).build();

    // event handlers, you can use these to dispatch actions to update your Redux store
    connection.on('QueueStateChanged', onQueueStateChange(dispatch, getState));
    connection.on('QueueCountChanged', onQueueCountChange(dispatch, getState));
    connection.on('CommandProcessingStatus', onQueueRefreshState(dispatch));

    // re-establish the connection if connection dropped
    connection.onclose(() => debounce(() => { handleReconnect(connection); }, 5000));

    startSignalRConnection(connection);
  }

  return next(action);
};

export default signalRMiddleware;
