import { createSlice } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';

const miscSlice = createSlice({
  name: 'misc',
  initialState: {
    trakt: {
      usercode: '',
      url: '',
    },
    plex: {
      url: '',
      authenticated: false,
    },
    webuiUpdateAvailable: false,
    webuiPreviewTheme: null,
  },
  reducers: {
    setItem(sliceState, action: PayloadAction<object>) {
      return Object.assign({}, sliceState, action.payload);
    },
  },
});

export const { setItem } = miscSlice.actions;

export default miscSlice.reducer;
