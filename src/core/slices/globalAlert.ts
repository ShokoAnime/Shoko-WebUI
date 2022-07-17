import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { GlobalAlertType } from '../types/api';

const globalAlertSlice = createSlice({
  name: 'fetching',
  initialState: [] as Array<GlobalAlertType>,
  reducers: {
    setGlobalAlert(sliceState, action: PayloadAction<Array<GlobalAlertType>>) {
      return action.payload;
    },
  },
});

export const { setGlobalAlert } = globalAlertSlice.actions;

export default globalAlertSlice.reducer;
