import { createSlice } from '@reduxjs/toolkit';

import type { SeriesInfoType, QueueStatusType } from '../types/api';

type State = {
  fetched: {
    [key: string]: boolean,
  };
  importFolderSeries: Array<SeriesInfoType>;
  queueStatus: QueueStatusType;
  unrecognizedMark: Array<string>;
};

const mainpageSlice = createSlice({
  name: 'mainpage',
  initialState: {
    fetched: {},
    importFolderSeries: [],
    queueStatus: {} as QueueStatusType,
    selectedImportFolderSeries: 1,
    unrecognizedMark: [],
  } as State,
  reducers: {
    setFetched(sliceState, action) {
      sliceState.fetched = Object.assign({}, sliceState.fetched, { [action.payload]: true });
    },
    setImportFolderSeries(sliceState, action) {
      sliceState.importFolderSeries = action.payload;
    },
    setQueueStatus(sliceState, action) {
      sliceState.queueStatus = Object.assign({}, sliceState.queueStatus, action.payload);
    },
    markUnrecognizedFile(sliceState, action) {
      sliceState.unrecognizedMark = action.payload.state === true ? [...sliceState.unrecognizedMark, action.payload.id] : sliceState.unrecognizedMark.filter(id => id !== action.payload.id);
    },
  },
});

export const {
  setFetched,
  setImportFolderSeries, setQueueStatus,
  markUnrecognizedFile,
} = mainpageSlice.actions;

export default mainpageSlice.reducer;
