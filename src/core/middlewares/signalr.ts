/* dprint-ignore-file */
import {
  HttpTransportType,
  type HubConnection,
  HubConnectionBuilder,
  JsonHubProtocol,
  LogLevel,
} from '@microsoft/signalr';
import { debounce, defer, delay, forEach, round } from 'lodash';
import moment from 'moment';

import Events from '@/core/events';
import { splitV3Api } from '@/core/rtkQuery/splitV3Api';
import { setFetched, setHttpBanStatus, setNetworkStatus, setQueueStatus, setUdpBanStatus } from '@/core/slices/mainpage';
import { restoreAVDumpSessions, updateAVDumpEvent } from '@/core/slices/utilities/avdump';
import { AVDumpEventTypeEnum } from '@/core/types/signalr';

import type { AVDumpEventType, AVDumpRestoreType, AniDBBanItemType, NetworkAvailability } from '@/core/types/signalr';

let lastRetry = moment();
let attempts = 0;
const maxTimeout = 60000;

let connectionEvents: HubConnection;

// Queue Events

const onQueueStateChange = dispatch => (queue, state) => {
  const newState = Object.assign({}, { [queue]: state });
  dispatch(setQueueStatus(newState));
};

const onQueueConnected = dispatch => (state) => {
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
  dispatch(setFetched('queueStatus'));
};

// AniDB Events

const onAniDBConnected = dispatch => (state: Array<AniDBBanItemType>) => {
  dispatch(setUdpBanStatus(state[0]));
  dispatch(setHttpBanStatus(state[1]));
};

const onAniDBUDPStateUpdate = dispatch => (state: AniDBBanItemType) => {
  dispatch(setUdpBanStatus(state));
};

const onAniDBHttpStateUpdate = dispatch => (state: AniDBBanItemType) => {
  dispatch(setHttpBanStatus(state));
};

// Network Events

const onNetworkChanged = dispatch => ({ networkAvailability }: { networkAvailability: NetworkAvailability }) => {
  dispatch(setNetworkStatus(networkAvailability));
};

// AVDump Events

const onAvDumpConnected = dispatch => (state: AVDumpRestoreType[]) => {
  dispatch(restoreAVDumpSessions(state));
};

const onAvDumpEvent = dispatch => (event: AVDumpEventType) => {
  switch (event.type) {
    case AVDumpEventTypeEnum.Started:
    case AVDumpEventTypeEnum.Success:
    case AVDumpEventTypeEnum.Failure:
    case AVDumpEventTypeEnum.GenericException:
    case AVDumpEventTypeEnum.InstallException:
      dispatch(updateAVDumpEvent(event));
      break;

    default:
      break;
  }
};

// Shoko Events

const onFileDeleted = dispatch => () => {
  dispatch(splitV3Api.util.invalidateTags(['FileDeleted']));
};

const onFileHashed = dispatch => () => {
  dispatch(splitV3Api.util.invalidateTags(['FileHashed']));
};

const onFileMatched = dispatch => () => {
  dispatch(splitV3Api.util.invalidateTags(['FileMatched']));
};

const onSeriesUpdated = dispatch => () => {
  dispatch(splitV3Api.util.invalidateTags(['SeriesUpdated']));
};

const onEpisodeUpdated = dispatch => () => {
  dispatch(splitV3Api.util.invalidateTags(['EpisodeUpdated']));
};

const startSignalRConnection = connection =>
  connection.start().then(() => {
    lastRetry = moment();
    attempts = 0;
  }).catch(err => console.error('SignalR Connection Error: ', err));

const handleReconnect = (connection) => {
  if (attempts < 4) attempts += 1;
  const duration = moment.duration(lastRetry.diff(moment()));
  lastRetry = moment();
  const elapsed = duration.as('milliseconds');
  const timeout = round(Math.min(Math.exp(attempts) * 2000, maxTimeout));
  if (elapsed < timeout) {
    delay(
      (conn) => {
        startSignalRConnection(conn);
      },
      timeout,
      connection,
    );
  } else {
    defer((conn) => {
      startSignalRConnection(conn);
    }, connection);
  }
};

const signalRMiddleware = ({
  dispatch,
  getState,
}) =>
  next =>
    async (action) => {
      // register signalR after the user logged in
      if (action.type === Events.MAINPAGE_LOAD) {
        if (connectionEvents !== undefined) return next(action);
        const connectionHub = '/signalr/aggregate?feeds=anidb,shoko,queue,network,avdump';

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
        connectionEvents.on('Queue:QueueStateChanged', onQueueStateChange(dispatch));
        connectionEvents.on('Queue:OnConnected', onQueueConnected(dispatch));

        connectionEvents.on('AniDB:OnConnected', onAniDBConnected(dispatch));
        connectionEvents.on('AniDB:AniDBUDPStateUpdate', onAniDBUDPStateUpdate(dispatch));
        connectionEvents.on('AniDB:AniDBHttpStateUpdate', onAniDBHttpStateUpdate(dispatch));

        connectionEvents.on('Network:OnConnected', onNetworkChanged(dispatch));
        connectionEvents.on('Network:NetworkAvailabilityChanged', onNetworkChanged(dispatch));

        connectionEvents.on('AVDump:OnConnected', onAvDumpConnected(dispatch));
        connectionEvents.on('AVDump:Event', onAvDumpEvent(dispatch));

        // connectionEvents.on('ShokoEvent:FileDetected', onFileDetected(dispatch)); // Not needed for now
        connectionEvents.on('ShokoEvent:FileDeleted', onFileDeleted(dispatch));
        connectionEvents.on('ShokoEvent:FileHashed', onFileHashed(dispatch));
        connectionEvents.on('ShokoEvent:FileMatched', onFileMatched(dispatch));
        connectionEvents.on('ShokoEvent:SeriesUpdated', onSeriesUpdated(dispatch));
        connectionEvents.on('ShokoEvent:EpisodeUpdated', onEpisodeUpdated(dispatch));

        // re-establish the connection if connection dropped
        connectionEvents.onclose(() =>
          debounce(() => {
            handleReconnect(connectionEvents);
          }, 5000));

        startSignalRConnection(connectionEvents);
      } else if (action.type === Events.AUTH_LOGOUT) {
        await connectionEvents?.stop();
      }

      return next(action);
    };

export default signalRMiddleware;
