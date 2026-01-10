import { createSlice } from '@reduxjs/toolkit';

const fetchingSlice = createSlice({
  name: 'fetching',
  initialState: {
    settings: true,
  } as Record<string, boolean>,
  reducers: {
    startFetching(sliceState, action) {
      return { ...sliceState, [action.payload]: true };
    },
    stopFetching(sliceState, action) {
      return { ...sliceState, [action.payload]: false };
    },
  },
});

export const { startFetching, stopFetching } = fetchingSlice.actions;

export default fetchingSlice.reducer;
