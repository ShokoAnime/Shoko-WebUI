import { createSlice } from '@reduxjs/toolkit';

import { NetworkAvailability } from '@/core/types/signalr';

import type { AniDBBanItemType, AniDBBanType, QueueStatusType } from '@/core/types/signalr';
import type { SliceActions } from '@/core/types/util';
import type { PayloadAction } from '@reduxjs/toolkit';

type State = {
  fetched: {
    [key: string]: boolean;
  };
  queueStatus: QueueStatusType;
  banStatus: AniDBBanType;
  networkStatus: NetworkAvailability;
  queueModalOpen: boolean;
  layoutEditMode: boolean;
};

const mainpageSlice = createSlice({
  name: 'mainpage',
  initialState: {
    fetched: {},
    queueStatus: {
      HasherQueueState: {
        state: 17,
        description: 'Idle',
        currentCommandID: null,
        status: 'Idle',
        queueCount: 0,
      },
      GeneralQueueState: {
        state: 17,
        description: 'Idle',
        currentCommandID: null,
        status: 'Idle',
        queueCount: 0,
      },
      ImageQueueState: {
        state: 17,
        description: 'Idle',
        currentCommandID: null,
        status: 'Idle',
        queueCount: 0,
      },
    },
    banStatus: {
      http: {
        updateType: 2,
        value: false,
      },
      udp: {
        updateType: 1,
        value: false,
      },
    } as AniDBBanType,
    networkStatus: NetworkAvailability.Internet,
    queueModalOpen: false,
    layoutEditMode: false,
  } as State,
  reducers: {
    setFetched(sliceState, action) {
      sliceState.fetched = Object.assign({}, sliceState.fetched, { [action.payload]: true });
    },
    setQueueStatus(sliceState, action: PayloadAction<Partial<QueueStatusType>>) {
      sliceState.queueStatus = Object.assign({}, sliceState.queueStatus, action.payload);
    },
    setUdpBanStatus(sliceState, action: PayloadAction<AniDBBanItemType>) {
      sliceState.banStatus.udp = action.payload;
    },
    setHttpBanStatus(sliceState, action: PayloadAction<AniDBBanItemType>) {
      sliceState.banStatus.http = action.payload;
    },
    setLayoutEditMode(sliceState, action) {
      sliceState.layoutEditMode = action.payload;
    },
    setQueueModalOpen(sliceState, action) {
      sliceState.queueModalOpen = action.payload;
    },
    setNetworkStatus(sliceState, action: PayloadAction<NetworkAvailability>) {
      sliceState.networkStatus = action.payload;
    },
  },
});

export const {
  setFetched,
  setHttpBanStatus,
  setLayoutEditMode,
  setNetworkStatus,
  setQueueModalOpen,
  setQueueStatus,
  setUdpBanStatus,
} = mainpageSlice.actions;

export type MainpageActionTypes = SliceActions<typeof mainpageSlice.actions>;

export default mainpageSlice.reducer;
