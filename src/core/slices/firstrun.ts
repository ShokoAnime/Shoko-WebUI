import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { DefaultUserType, ServerStatusType } from '../types/api/init';

export type TestStatusType = {
  type: 'error' | 'success' | '';
  text: string;
};

type State = {
  anidbStatus: TestStatusType;
  databaseStatus: TestStatusType;
  userStatus: TestStatusType;
  saved: {
    [key: string]: boolean;
  };
  serverStatus: ServerStatusType;
  user: DefaultUserType;
};

const initialState = {
  anidbStatus: {},
  databaseStatus: {},
  userStatus: {},
  saved: {},
  serverStatus: {
    State: 1,
  },
  user: {},
} as State;

const firstrunSlice = createSlice({
  name: 'firstrun',
  initialState,
  reducers: {
    setAnidbStatus(sliceState, action: PayloadAction<TestStatusType>) {
      sliceState.anidbStatus = action.payload;
    },
    setDatabaseStatus(sliceState, action: PayloadAction<TestStatusType>) {
      sliceState.databaseStatus = action.payload;
    },
    setUserStatus(sliceState, action: PayloadAction<TestStatusType>) {
      sliceState.userStatus = action.payload;
    },
    setSaved(sliceState, action: PayloadAction<string>) {
      sliceState.saved = Object.assign({}, sliceState.saved, { [action.payload]: true });
    },
    setServerStatus(sliceState, action: PayloadAction<any>) {
      sliceState.serverStatus = action.payload;
    },
    setUser(sliceState, action: PayloadAction<any>) {
      sliceState.user = Object.assign({}, sliceState.user, action.payload);
    },
    unsetSaved(sliceState, action: PayloadAction<string>) {
      sliceState.saved = Object.assign({}, sliceState.saved, { [action.payload]: false });
    },
  },
});

export const {
  setAnidbStatus, setDatabaseStatus, setUserStatus,
  setSaved, setServerStatus, setUser, unsetSaved,
} = firstrunSlice.actions;

export default firstrunSlice.reducer;
