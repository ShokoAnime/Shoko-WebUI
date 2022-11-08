import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { QueueStatusType, AniDBBanType, AniDBBanItemType } from '../types/signalr';

type State = {
  fetched: {
    [key: string]: boolean,
  };
  queueStatus: QueueStatusType;
  banStatus: AniDBBanType;
  layoutEditMode: boolean;
};

const mainpageSlice = createSlice({
  name: 'mainpage',
  initialState: {
    fetched: {},
    queueStatus: {} as QueueStatusType,
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
    layoutEditMode: false,
  } as State,
  reducers: {
    setFetched(sliceState, action) {
      sliceState.fetched = Object.assign({}, sliceState.fetched, { [action.payload]: true });
    },
    setQueueStatus(sliceState, action) {
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
  },
});

export const {
  setFetched,
  setQueueStatus,
  setUdpBanStatus,
  setHttpBanStatus,
  setLayoutEditMode,
} = mainpageSlice.actions;

export default mainpageSlice.reducer;
