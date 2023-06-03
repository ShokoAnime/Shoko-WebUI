import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { UserType } from '@/core/types/api/init';

export type TestStatusType = {
  type: 'error' | 'success' | '';
  text: string;
};

type State = {
  saved: {
    [key: string]: boolean;
  };
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
      sliceState.saved = Object.assign({}, sliceState.saved, { [action.payload]: true });
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
  setSaved, setUser, unsetSaved,
} = firstrunSlice.actions;

export default firstrunSlice.reducer;
