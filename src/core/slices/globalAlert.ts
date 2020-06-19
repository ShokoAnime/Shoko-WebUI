import { createSlice } from '@reduxjs/toolkit';

const globalAlertSlice = createSlice({
  name: 'fetching',
  initialState: [] as Array<any>,
  reducers: {
    setGlobalAlert(sliceState, action) {
      return action.payload;
    },
  },
});

export const { setGlobalAlert } = globalAlertSlice.actions;

export default globalAlertSlice.reducer;
