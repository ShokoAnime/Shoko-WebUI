/* eslint-disable max-len */
import {
  JsonHubProtocol, HttpTransportType, HubConnectionBuilder, LogLevel,
} from '@aspnet/signalr';
import moment from 'moment';
import {
  debounce, delay, defer, round, forEach,
} from 'lodash';

import Events from '../events';
import { setQueueStatus } from '../slices/mainpage';
import { prependLines, appendLines } from '../slices/logs';

let lastRetry = moment();
let attempts = 0;
const maxTimeout = 60000;

let connectionEvents;
let connectionLog;

const onQueueStateChange = dispatch => (queue, state) => {
  const newState = Object.assign({}, { [queue]: state });
  dispatch(setQueueStatus(newState));
};
const onQueueCountChange = (dispatch, getState) => (queue, count) => {
  const currentQueue = getState().mainpage.queueStatus[queue];
  if (queue === 'GeneralQueueCount' && currentQueue > count) dispatch({ type: Events.MAINPAGE_REFRESH });

  const newState = Object.assign({}, { [queue]: count });
  dispatch(setQueueStatus(newState));
};
const onQueueRefreshState = dispatch => (state) => {
  const fixedState = {};
  forEach(state, (item, key) => {
    const letter = key.substr(0, 1);
    const letterUp = letter.toUpperCase();
    if (letter === letterUp) {
      fixedState[key] = item;
      return;
    }
    const fixedKey = `${letterUp}${key.substr(1)}`;
    fixedState[fixedKey] = item;
  });
  dispatch(setQueueStatus(fixedState));
};

const onLogsGetBacklog = dispatch => (state) => {
  dispatch(prependLines(state));
};

const onLogsLog = dispatch => (state) => {
  dispatch(appendLines(state));
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
    if (connectionEvents !== undefined) { return next(action); }
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
    connectionEvents = new HubConnectionBuilder().withUrl(connectionHub, options).withHubProtocol(protocol).build();

    // event handlers, you can use these to dispatch actions to update your Redux store
    connectionEvents.on('QueueStateChanged', onQueueStateChange(dispatch));
    connectionEvents.on('QueueCountChanged', onQueueCountChange(dispatch, getState));
    connectionEvents.on('CommandProcessingStatus', onQueueRefreshState(dispatch));

    // re-establish the connection if connection dropped
    connectionEvents.onclose(() => debounce(() => { handleReconnect(connectionEvents); }, 5000));

    startSignalRConnection(connectionEvents);
  } else if (action.type === Events.LOGPAGE_LOAD) {
    if (connectionLog !== undefined) { return next(action); }
    const connectionLogHub = '/signalr/logging';
    const protocol = new JsonHubProtocol();
    // eslint-disable-next-line no-bitwise
    const transport = HttpTransportType.WebSockets | HttpTransportType.LongPolling;
    const options = {
      transport,
      logMessageContent: true,
      logger: LogLevel.Warning,
      accessTokenFactory: () => getState().apiSession.apikey,
    };
    connectionLog = new HubConnectionBuilder().withUrl(connectionLogHub, options).withHubProtocol(protocol).build();
    connectionLog.on('GetBacklog', onLogsGetBacklog(dispatch));
    connectionLog.on('Log', onLogsLog(dispatch));
    startSignalRConnection(connectionLog);
  }

  return next(action);
};

export default signalRMiddleware;
