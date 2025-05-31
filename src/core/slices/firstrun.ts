import { createSlice } from '@reduxjs/toolkit';

import type { UserType } from '@/core/types/api/init';
import type { PayloadAction } from '@reduxjs/toolkit';

export type TestStatusType = {
  type: 'error' | 'success' | '';
  text: string;
};

type State = {
  saved: Record<string, boolean>;
  user: UserType;
};

const initialState = {
  saved: {},
  user: {},
} as State;

const firstrunSlice = createSlice({
  name: 'firstrun',
  initialState,
  reducers: {
    setSaved(sliceState, action: PayloadAction<string>) {
      sliceState.saved = { ...sliceState.saved, [action.payload]: true };
    },
    setUser(sliceState, action: PayloadAction<UserType>) {
      sliceState.user = { ...sliceState.user, ...action.payload };
    },
    unsetSaved(sliceState, action: PayloadAction<string>) {
      sliceState.saved = { ...sliceState.saved, [action.payload]: false };
    },
  },
});

export const {
  setSaved,
  setUser,
  unsetSaved,
} = firstrunSlice.actions;

export default firstrunSlice.reducer;
