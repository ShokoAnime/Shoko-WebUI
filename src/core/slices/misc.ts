import { createSlice } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';

type State = {
  plex: {
    url: string;
    authenticated: boolean;
  };
  webuiUpdateAvailable: boolean;
  webuiPreviewTheme: string;
};

const initialState: State = {
  plex: {
    url: '',
    authenticated: false,
  },
  webuiUpdateAvailable: false,
  webuiPreviewTheme: '',
};

const miscSlice = createSlice({
  name: 'misc',
  initialState,
  reducers: {
    setItem(sliceState, action: PayloadAction<object>) {
      return { ...sliceState, ...action.payload };
    },
  },
});

export const { setItem } = miscSlice.actions;

export default miscSlice.reducer;
