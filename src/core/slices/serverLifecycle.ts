import { createSlice } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';

export type ServerLifecycleAction = 'idle' | 'restarting' | 'shutting-down';

type State = {
  action: ServerLifecycleAction;
  initiatedAt: number | null;
};

const initialState: State = {
  action: 'idle',
  initiatedAt: null,
};

const serverLifecycleSlice = createSlice({
  name: 'serverLifecycle',
  initialState,
  reducers: {
    clearAction(sliceState) {
      sliceState.action = 'idle';
      sliceState.initiatedAt = null;
    },
    setAction(sliceState, action: PayloadAction<ServerLifecycleAction>) {
      sliceState.action = action.payload;
      sliceState.initiatedAt = action.payload === 'idle' ? null : Date.now();
    },
  },
});

export const { clearAction, setAction } = serverLifecycleSlice.actions;

export default serverLifecycleSlice.reducer;
