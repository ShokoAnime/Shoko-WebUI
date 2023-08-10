import { createSlice } from '@reduxjs/toolkit';

import type { AniDBBanItemType, AniDBBanType, QueueStatusType } from '@/core/types/signalr';
import type { PayloadAction } from '@reduxjs/toolkit';

type State = {
  fetched: {
    [key: string]: boolean;
  };
  queueStatus: QueueStatusType;
  banStatus: AniDBBanType;
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
    queueModalOpen: false,
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
    setQueueModalOpen(sliceState, action) {
      sliceState.queueModalOpen = action.payload;
    },
  },
});

export const {
  setFetched,
  setHttpBanStatus,
  setLayoutEditMode,
  setQueueModalOpen,
} = mainpageSlice.actions;

export default mainpageSlice.reducer;
