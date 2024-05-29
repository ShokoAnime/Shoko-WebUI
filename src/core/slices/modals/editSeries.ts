import { createSlice } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';

const editSeriesSlice = createSlice({
  name: 'editSeries',
  initialState: {
    seriesId: -1,
  },
  reducers: {
    setSeriesId(sliceState, action: PayloadAction<number>) {
      sliceState.seriesId = action.payload;
    },
  },
});

export const { setSeriesId } = editSeriesSlice.actions;

export default editSeriesSlice.reducer;
