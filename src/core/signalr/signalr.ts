import {
  HttpTransportType,
  type HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  JsonHubProtocol,
  LogLevel,
} from '@microsoft/signalr';
import { throttle } from 'lodash';

import Events from '@/core/events';
import queryClient from '@/core/react-query/queryClient';
import { handleEvent } from '@/core/signalr/eventHandlers';
import {
  resetQueueStatus,
  setFetched,
  setHttpBanStatus,
  setNetworkStatus,
  setQueueStatus,
  setUdpBanStatus,
} from '@/core/slices/mainpage';
import { restoreAVDumpSessions, updateAVDumpEvent } from '@/core/slices/utilities/avdump';
import toast from '@/core/toast';

import type {
  AVDumpEventType,
  AVDumpRestoreType,
  AniDBBanItemType,
  NetworkAvailabilityValues,
  QueueStatusType,
  RestartReasonsEventType,
  RestartRequiredType,
  SeriesUpdateEventType,
} from '@/core/signalr/types';
import type store from '@/core/store';
import type { RootState } from '@/core/store';
import type { Middleware, UnknownAction } from 'redux';

let connectionEvents: HubConnection;

// Queue Events

const queueEventThrottling = throttle(() => {
  handleEvent('QueueStateChanged');
}, 1000);

const onQueueStateChange = (dispatch: typeof store.dispatch) =>
  throttle((state: QueueStatusType) => {
    queueEventThrottling();
    if (!state) {
      dispatch(resetQueueStatus());
      return;
    }
    dispatch(setQueueStatus(state));
  }, 500);

const onQueueConnected = (dispatch: typeof store.dispatch) => (state: QueueStatusType) => {
  handleEvent('QueueStateChanged');
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

// Restart Events, shown by RestartNotice

const onRestartRequiredUpdate = (state: RestartRequiredType) => {
  queryClient.setQueryData(['init', 'configuration-restart'], state.RequiresRestart);
};

const onRestartReasonsUpdate = (state: RestartReasonsEventType) => {
  queryClient.setQueryData(['init', 'restart-reasons'], state.Reasons);
};

// Network Events

type NetworkAvailabilityType = { NetworkAvailability: NetworkAvailabilityValues };
const onNetworkChanged = (dispatch: typeof store.dispatch) => ({ NetworkAvailability }: NetworkAvailabilityType) =>
  dispatch(setNetworkStatus(NetworkAvailability));

// AVDump Events

const onAvDumpConnected = (dispatch: typeof store.dispatch) => (state: AVDumpRestoreType[]) => {
  dispatch(restoreAVDumpSessions(state));
};

const onAvDumpEvent = (dispatch: typeof store.dispatch) => (event: AVDumpEventType) => {
  switch (event.Type) {
    case 'Started':
    case 'Success':
    case 'Failure':
    case 'GenericException':
    case 'InstallException':
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
  // oxlint-disable-next-line typescript/unbound-method -- getState comes from the middleware API and is called unbound by design
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
      // The restart feed is for admins only, so only they join it.
      const { isAdmin } = (action.payload ?? {}) as { isAdmin?: boolean };
      const feeds = ['anidb', 'file', 'metadata', 'release', 'queue', 'network', 'avdump', 'configuration'];
      if (isAdmin) feeds.push('restart');
      const connectionHub = `/signalr/aggregate?feeds=${feeds.join(',')}`;

      const protocol = new JsonHubProtocol();

      // oxlint-disable-next-line no-bitwise -- allow the transport to fall back to LongPolling if it needs to
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
      connectionEvents.on('Queue:connected', onQueueConnected(dispatch));
      connectionEvents.on('queue:state.changed', onQueueStateChange(dispatch));

      connectionEvents.on('anidb:connected', onAniDBConnected(dispatch));
      connectionEvents.on('anidb:udp.stateUpdate', onAniDBUDPStateUpdate(dispatch));
      connectionEvents.on('anidb:http.stateUpdate', onAniDBHttpStateUpdate(dispatch));

      connectionEvents.on('network:connected', onNetworkChanged(dispatch));
      connectionEvents.on('network:availabilityChanged', onNetworkChanged(dispatch));

      connectionEvents.on('avdump:connected', onAvDumpConnected(dispatch));
      connectionEvents.on('avdump:event', onAvDumpEvent(dispatch));

      connectionEvents.on('file:detected', () => handleEvent('FileDetected'));
      connectionEvents.on('file:hashed', () => handleEvent('FileHashed'));
      connectionEvents.on(
        'file:relocated',
        (
          event: { Moved: boolean, Renamed: boolean },
        ) => (!event.Moved && event.Renamed ? handleEvent('FileRenamed') : handleEvent('FileMoved')),
      );
      connectionEvents.on('file:deleted', () => handleEvent('FileDeleted'));

      connectionEvents.on('release:saved', () => handleEvent('FileMatched'));
      connectionEvents.on('release:removed', () => handleEvent('FileMatched'));

      const onSeriesEvent = (event: SeriesUpdateEventType) => handleEvent('SeriesUpdated', event);
      connectionEvents.on('metadata:series.added', onSeriesEvent);
      connectionEvents.on('metadata:series.updated', onSeriesEvent);
      connectionEvents.on('metadata:series.removed', onSeriesEvent);

      connectionEvents.on('configuration:connected', onRestartRequiredUpdate);
      connectionEvents.on('configuration:requiresRestart', onRestartRequiredUpdate);

      connectionEvents.on('restart:connected', onRestartReasonsUpdate);
      connectionEvents.on('restart:reasonsChanged', onRestartReasonsUpdate);

      connectionEvents.onreconnecting(() => {
        // Suppress during a user-initiated restart/shutdown; StatusPage is the canonical UX then
        if (getState().serverLifecycle.action !== 'idle') return;
        toast.error('SignalR connection lost!', 'Trying to reconnect...', {
          autoClose: 200000,
          toastId: 'signalr-reconnecting',
        });
      });

      connectionEvents.onreconnected(() => {
        toast.dismiss('signalr-reconnecting');
        // Suppress during a user-initiated restart/shutdown; StatusPage is the canonical UX then
        if (getState().serverLifecycle.action !== 'idle') return;
        toast.success('SignalR connection restored!', undefined, { toastId: 'signalr-connected' });
      });

      connectionEvents.onclose(() => {
        toast.dismiss('signalr-reconnecting');
        // Suppress during a user-initiated restart/shutdown; StatusPage is the canonical UX then
        if (getState().serverLifecycle.action !== 'idle') return;
        toast.error(
          'SignalR connection could not be re-established!',
          'Check if your server is running and refresh the page once it has started',
          { autoClose: false, toastId: 'signalr-disconnected' },
        );
      });

      startSignalRConnection(connectionEvents).catch(console.error);
    } else if (action.type === Events.AUTH_LOGOUT) {
      await connectionEvents?.stop();
      queryClient.removeQueries({ queryKey: ['init', 'restart-reasons'] });
      queryClient.removeQueries({ queryKey: ['init', 'configuration-restart'] });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : undefined;
    toast.error('SignalR connection could not be established!', message);
  }

  return next(action);
};

export default signalRMiddleware;
