import { createSlice } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';

type State = {
  trakt: {
    usercode: string;
    url: string;
  };
  plex: {
    url: string;
    authenticated: boolean;
  };
  webuiUpdateAvailable: boolean;
  webuiPreviewTheme: string;
};

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
    webuiPreviewTheme: '',
  } as State,
  reducers: {
    setItem(sliceState, action: PayloadAction<object>) {
      return { ...sliceState, ...action.payload };
    },
  },
});

export const { setItem } = miscSlice.actions;

export default miscSlice.reducer;
