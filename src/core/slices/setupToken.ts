import { createSlice } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';

// The setup token the server asks for in setup and failure mode. Persisted with the rest of the store to session
// storage only, never to local storage, and cleared once the server has started.
type State = {
  token: string;
};

const initialState: State = {
  token: '',
};

const setupTokenSlice = createSlice({
  name: 'setupToken',
  initialState,
  reducers: {
    clearSetupToken(sliceState) {
      sliceState.token = '';
    },
    setSetupToken(sliceState, action: PayloadAction<string>) {
      sliceState.token = action.payload;
    },
  },
});

export const { clearSetupToken, setSetupToken } = setupTokenSlice.actions;

export default setupTokenSlice.reducer;
