import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { DefaultUserType, StatusType } from '../types/api/init';

type TestStatusType = {
  type: 'error' | 'success' | '';
  text: string;
};

type State = {
  activeTab: string;
  anidbStatus: TestStatusType;
  databaseStatus: TestStatusType;
  saved: {
    [key: string]: boolean;
  };
  status: StatusType;
  user: DefaultUserType;
};

const initialState = {
  activeTab: 'acknowledgement',
  anidbStatus: {},
  databaseStatus: {},
  saved: {},
  status: {},
  user: {},
} as State;

const firstrunSlice = createSlice({
  name: 'firstrun',
  initialState,
  reducers: {
    setActiveTab(sliceState, action: PayloadAction<string>) {
      sliceState.activeTab = action.payload;
    },
    setAnidbStatus(sliceState, action: PayloadAction<TestStatusType>) {
      sliceState.anidbStatus = action.payload;
    },
    setDatabaseStatus(sliceState, action: PayloadAction<TestStatusType>) {
      sliceState.databaseStatus = action.payload;
    },
    setSaved(sliceState, action: PayloadAction<string>) {
      sliceState.saved = Object.assign(sliceState.saved, { [action.payload]: true });
    },
    setStatus(sliceState, action: PayloadAction<any>) {
      sliceState.status = action.payload;
    },
    setUser(sliceState, action: PayloadAction<any>) {
      sliceState.user = Object.assign(sliceState.user, action.payload);
    },
  },
});

export const {
  setActiveTab, setAnidbStatus, setDatabaseStatus,
  setSaved, setStatus, setUser,
} = firstrunSlice.actions;

export default firstrunSlice.reducer;
