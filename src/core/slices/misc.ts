import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
  } as any,
  reducers: {
    setItem(sliceState, action: PayloadAction<any>) {
      return Object.assign({}, sliceState, action.payload);
    },
  },
});

export const { setItem } = miscSlice.actions;

export default miscSlice.reducer;
