import { createSlice } from '@reduxjs/toolkit';

const fetchingSlice = createSlice({
  name: 'fetching',
  initialState: {
    settings: true,
  } as { [key: string]: boolean },
  reducers: {
    startFetching(sliceState, action) {
      return Object.assign({}, sliceState, { [action.payload]: true });
    },
    stopFetching(sliceState, action) {
      return Object.assign({}, sliceState, { [action.payload]: false });
    },
  },
});

export const { startFetching, stopFetching } = fetchingSlice.actions;

export default fetchingSlice.reducer;
