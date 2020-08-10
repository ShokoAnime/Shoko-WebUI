import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { concat } from 'lodash';

const logsSlice = createSlice({
  name: 'logs',
  initialState: {
    lines: [],
  } as any,
  reducers: {
    prependLines(sliceState, action: PayloadAction<any>) {
      const lines = concat(action.payload, sliceState.lines);
      return Object.assign({}, sliceState, { lines });
    },
    appendLines(sliceState, action: PayloadAction<any>) {
      const lines = concat(sliceState.lines, action.payload);
      return Object.assign({}, sliceState, { lines });
    },
  },
});

export const { prependLines, appendLines } = logsSlice.actions;

export default logsSlice.reducer;
