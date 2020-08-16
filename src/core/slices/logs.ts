import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  concat, slice, isArray, forEach,
} from 'lodash';
import moment from 'moment';

const formatStamp = date => moment(date).format('YYYY-MM-DD HH:mm:ss');

const fixTimestamps = (lines) => {
  if (isArray(lines)) {
    // eslint-disable-next-line no-param-reassign
    forEach(lines, (line, idx) => { lines[idx].timeStamp = formatStamp(line.timeStamp); });
  }
};

const logsSlice = createSlice({
  name: 'logs',
  initialState: {
    lines: [],
  } as any,
  reducers: {
    prependLines(sliceState, action: PayloadAction<any>) {
      fixTimestamps(action.payload);
      const lines = concat(action.payload, sliceState.lines);
      return Object.assign({}, sliceState, { lines });
    },
    appendLines(sliceState, action: PayloadAction<any>) {
      fixTimestamps(action.payload);
      const lines = slice(sliceState.lines);
      lines.push(action.payload);
      return Object.assign({}, sliceState, { lines });
    },
  },
});

export const { prependLines, appendLines } = logsSlice.actions;

export default logsSlice.reducer;
