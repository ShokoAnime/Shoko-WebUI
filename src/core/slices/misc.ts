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
  advancedMode: boolean;
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
    advancedMode: false,
    webuiUpdateAvailable: false,
    webuiPreviewTheme: '',
  } as State,
  reducers: {
    setItem(sliceState, action: PayloadAction<object>) {
      return Object.assign({}, sliceState, action.payload);
    },
    setAdvancedMode(sliceState, action: PayloadAction<boolean>) {
      return Object.assign({}, sliceState, { advancedMode: action.payload });
    },
  },
});

export const { setAdvancedMode, setItem } = miscSlice.actions;

export default miscSlice.reducer;
