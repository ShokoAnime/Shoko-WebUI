import {
  HttpTransportType,
  type HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  JsonHubProtocol,
  LogLevel,
} from '@microsoft/signalr';
import { throttle } from 'lodash';

import toast from '@/components/Toast';
import Events from '@/core/events';
import { handleEvent } from '@/core/signalr/eventHandlers';
import { AVDumpEventTypeEnum } from '@/core/signalr/types';
import {
  resetQueueStatus,
  setFetched,
  setHttpBanStatus,
  setNetworkStatus,
  setQueueStatus,
  setUdpBanStatus,
} from '@/core/slices/mainpage';
import { restoreAVDumpSessions, updateAVDumpEvent } from '@/core/slices/utilities/avdump';

import type {
  AVDumpEventType,
  AVDumpRestoreType,
  AniDBBanItemType,
  NetworkAvailabilityEnum,
  QueueStatusType,
  SeriesUpdateEventType,
} from '@/core/signalr/types';
import type store from '@/core/store';
import type { RootState } from '@/core/store';
import type { Middleware, UnknownAction } from 'redux';

let connectionEvents: HubConnection;

// Queue Events

const onQueueStateChange = (dispatch: typeof store.dispatch) =>
  throttle((state: QueueStatusType) => {
    handleEvent('QueueStateChanged');
    if (!state) {
      dispatch(resetQueueStatus());
      return;
    }
    dispatch(setQueueStatus(state));
  }, 1000);

const onQueueConnected = (dispatch: typeof store.dispatch) => (state: QueueStatusType) => {
  dispatch(setQueueStatus(state));
  dispatch(setFetched('queueStatus'));
};

// AniDB Events

const onAniDBConnected = (dispatch: typeof store.dispatch) => (state: AniDBBanItemType[]) => {
  dispatch(setUdpBanStatus(state[0]));
  dispatch(setHttpBanStatus(state[1]));
};

const onAniDBUDPStateUpdate = (dispatch: typeof store.dispatch) => (state: AniDBBanItemType) => {
  dispatch(setUdpBanStatus(state));
};

const onAniDBHttpStateUpdate = (dispatch: typeof store.dispatch) => (state: AniDBBanItemType) => {
  dispatch(setHttpBanStatus(state));
};

// Network Events

type NetworkAvailabilityType = { NetworkAvailability: NetworkAvailabilityEnum };
const onNetworkChanged = (dispatch: typeof store.dispatch) => ({ NetworkAvailability }: NetworkAvailabilityType) =>
  dispatch(setNetworkStatus(NetworkAvailability));

// AVDump Events

const onAvDumpConnected = (dispatch: typeof store.dispatch) => (state: AVDumpRestoreType[]) => {
  dispatch(restoreAVDumpSessions(state));
};

const onAvDumpEvent = (dispatch: typeof store.dispatch) => (event: AVDumpEventType) => {
  switch (event.Type) {
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

const startSignalRConnection = (connection: HubConnection) =>
  connection.start().catch((error: Error) => {
    console.error(error);
    toast.error('SignalR connection error!', error.toString());
  });

const signalRMiddleware: Middleware<object, RootState> = ({
  dispatch,
  // eslint-disable-next-line @typescript-eslint/unbound-method
  getState,
}) =>
next =>
async (action: UnknownAction) => {
  try {
    // register signalR after the user logged in
    if (action.type === Events.MAINPAGE_LOADED) {
      if (connectionEvents !== undefined && connectionEvents.state !== HubConnectionState.Disconnected) {
        return next(action);
      }
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
      connectionEvents = new HubConnectionBuilder()
        .withUrl(connectionHub, options)
        .withHubProtocol(protocol)
        .withAutomaticReconnect([5000, 15000, 30000, 60000, 90000])
        .build();

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

      connectionEvents.on('ShokoEvent:FileDeleted', () => handleEvent('FileDeleted'));
      connectionEvents.on('ShokoEvent:FileDetected', () => handleEvent('FileDetected'));
      connectionEvents.on('ShokoEvent:FileHashed', () => handleEvent('FileHashed'));
      connectionEvents.on('ShokoEvent:FileMatched', () => handleEvent('FileMatched'));
      connectionEvents.on('ShokoEvent:FileMoved', () => handleEvent('FileMoved'));
      connectionEvents.on('ShokoEvent:FileRenamed', () => handleEvent('FileRenamed'));
      connectionEvents.on(
        'ShokoEvent:SeriesUpdated',
        (event: SeriesUpdateEventType) => handleEvent('SeriesUpdated', event),
      );

      connectionEvents.onreconnecting(
        () =>
          toast.error('SignalR connection lost!', 'Trying to reconnect...', {
            autoClose: 200000,
            toastId: 'signalr-reconnecting',
          }),
      );

      connectionEvents.onreconnected(() => {
        toast.dismiss('signalr-reconnecting');
        toast.success('SignalR connection restored!', undefined, { toastId: 'signalr-connected' });
      });

      connectionEvents.onclose(() => {
        toast.dismiss('signalr-reconnecting');
        toast.error(
          'SignalR connection could not be re-established!',
          'Check if your server is running and refresh the page once it has started',
          { autoClose: false, toastId: 'signalr-disconnected' },
        );
      });

      startSignalRConnection(connectionEvents)
        .then(() => {
        })
        .catch(() => {
        });
    } else if (action.type === Events.AUTH_LOGOUT) {
      await connectionEvents?.stop();
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : undefined;
    toast.error('SignalR connection could not be established!', message);
  }

  return next(action);
};

export default signalRMiddleware;
