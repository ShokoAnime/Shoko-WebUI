import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { AniDBBanItemType, AniDBBanType, QueueStatusType } from '@/core/types/signalr';

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
    queueStatus: {
      HasherQueueState: {
        state: 17,
        description: '',
      },
      GeneralQueueState: {
        state: 17,
        description: '',
      },
      ImageQueueState: {
        state: 17,
        description: '',
      },
      HasherQueueCount: 0,
      GeneralQueueCount: 0,
      ImageQueueCount: 0,
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
