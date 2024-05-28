import { createSlice } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';

const editSeriesSlice = createSlice({
  name: 'editSeries',
  initialState: {
    seriesId: -1,
    status: false,
  },
  reducers: {
    setSeriesId(sliceState, action: PayloadAction<number>) {
      sliceState.seriesId = action.payload;
    },
    setStatus(sliceState, action: PayloadAction<boolean>) {
      sliceState.status = action.payload;
    },
  },
});

export const { setSeriesId, setStatus } = editSeriesSlice.actions;

export default editSeriesSlice.reducer;
