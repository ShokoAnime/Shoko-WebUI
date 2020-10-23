import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { mergeWith } from 'lodash';

import { initialState } from './serverSettings';

const localSettingsSlice = createSlice({
  name: 'localSettings',
  initialState,
  reducers: {
    saveLocalSettings(sliceState, action: PayloadAction<any>) {
      // eslint-disable-next-line consistent-return
      return mergeWith({}, sliceState, action.payload, (oldVal, newVal) => {
        if (Array.isArray(newVal)) {
          return newVal;
        }
      });
    },
  },
});

export const { saveLocalSettings } = localSettingsSlice.actions;

export default localSettingsSlice.reducer;
