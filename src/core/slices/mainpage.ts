import { createSlice } from '@reduxjs/toolkit';

import { NetworkAvailabilityEnum } from '@/core/signalr/types';

import type { AniDBBanItemType, AniDBBanType, QueueStatusType } from '@/core/signalr/types';
import type { SliceActions } from '@/core/types/util';
import type { PayloadAction } from '@reduxjs/toolkit';

type State = {
  fetched: Record<string, boolean>;
  queueStatus: QueueStatusType;
  banStatus: AniDBBanType;
  networkStatus: NetworkAvailabilityEnum;
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

const mainpageSlice = createSlice({
  name: 'mainpage',
  initialState: {
    fetched: {},
    queueStatus: initialQueueStatus,
    banStatus: {
      http: {
        UpdateType: 2,
        Value: false,
      },
      udp: {
        UpdateType: 1,
        Value: false,
      },
    } as AniDBBanType,
    networkStatus: NetworkAvailabilityEnum.Internet,
    layoutEditMode: false,
  } as State,
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
    setNetworkStatus(sliceState, action: PayloadAction<NetworkAvailabilityEnum>) {
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
