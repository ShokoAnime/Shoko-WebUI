import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { mergeDeep } from '../util';
import { initialState } from './serverSettings';

const localSettingsSlice = createSlice({
  name: 'localSettings',
  initialState,
  reducers: {
    changeLocalSettings(sliceState, action: PayloadAction<any>) {
      return mergeDeep(sliceState, action.payload);
    },
    saveLocalSettings(sliceState, action: PayloadAction<any>) {
      return Object.assign(sliceState, action.payload);
    },
  },
});

export const { changeLocalSettings, saveLocalSettings } = localSettingsSlice.actions;

export default localSettingsSlice.reducer;
