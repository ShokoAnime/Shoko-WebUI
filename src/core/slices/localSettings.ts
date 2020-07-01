import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { mergeDeep } from '../util';
import { initialState } from './serverSettings';

const localSettingsSlice = createSlice({
  name: 'localSettings',
  initialState,
  reducers: {
    saveLocalSettings(sliceState, action: PayloadAction<any>) {
      return mergeDeep(sliceState, action.payload);
    },
  },
});

export const { saveLocalSettings } = localSettingsSlice.actions;

export default localSettingsSlice.reducer;
