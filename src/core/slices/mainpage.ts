import { createSlice } from '@reduxjs/toolkit';

import type { AniDBBanItemType, NetworkAvailabilityValues, QueueStatusType } from '@/core/signalr/types';
import type { SliceActions } from '@/core/types/util';
import type { PayloadAction } from '@reduxjs/toolkit';

type AniDBBanType = {
  http: AniDBBanItemType;
  udp: AniDBBanItemType;
};

type State = {
  fetched: Record<string, boolean>;
  queueStatus: QueueStatusType;
  banStatus: AniDBBanType;
  networkStatus: NetworkAvailabilityValues;
  layoutEditMode: boolean;
};

const initialQueueStatus: QueueStatusType = {
  Running: true,
  WaitingCount: 0,
  BlockedCount: 0,
  TotalCount: 0,
  ThreadCount: 1,
  CurrentlyExecuting: [],
};

const initialState: State = {
  fetched: {},
  queueStatus: initialQueueStatus,
  banStatus: {
    http: {
      UpdateType: 'HTTPBan',
      Value: false,
    },
    udp: {
      UpdateType: 'UDPBan',
      Value: false,
    },
  } as AniDBBanType,
  networkStatus: 'Internet',
  layoutEditMode: false,
};

const mainpageSlice = createSlice({
  name: 'mainpage',
  initialState,
  reducers: {
    setFetched(sliceState, action) {
      sliceState.fetched = { ...sliceState.fetched, [action.payload]: true };
    },
    setQueueStatus(sliceState, action: PayloadAction<QueueStatusType>) {
      sliceState.queueStatus = { ...sliceState.queueStatus, ...action.payload };
    },
    resetQueueStatus(sliceState) {
      sliceState.queueStatus = initialQueueStatus;
    },
    setUdpBanStatus(sliceState, action: PayloadAction<AniDBBanItemType>) {
      if (sliceState.banStatus.udp.Value !== action.payload.Value) {
        sliceState.banStatus.udp = action.payload;
      }
    },
    setHttpBanStatus(sliceState, action: PayloadAction<AniDBBanItemType>) {
      if (sliceState.banStatus.http.Value !== action.payload.Value) {
        sliceState.banStatus.http = action.payload;
      }
    },
    setLayoutEditMode(sliceState, action: PayloadAction<boolean>) {
      sliceState.layoutEditMode = action.payload;
    },
    setNetworkStatus(sliceState, action: PayloadAction<NetworkAvailabilityValues>) {
      sliceState.networkStatus = action.payload;
    },
  },
});

export const {
  resetQueueStatus,
  setFetched,
  setHttpBanStatus,
  setLayoutEditMode,
  setNetworkStatus,
  setQueueStatus,
  setUdpBanStatus,
} = mainpageSlice.actions;

export type MainpageActionTypes = SliceActions<typeof mainpageSlice.actions>;

export default mainpageSlice.reducer;
