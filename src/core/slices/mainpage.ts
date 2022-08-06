import { createSlice } from '@reduxjs/toolkit';

import type { SeriesInfoType, QueueStatusType } from '../types/api';
import type { FileType } from '../types/api/file';
import type { ImportFolderType } from '../types/api/import-folder';

type State = {
  avdump: {
    [key: string]: {
      fetching: boolean;
      hash?: string;
    },
  };
  fetched: {
    [key: string]: boolean,
  };
  importFolders: Array<ImportFolderType>;
  importFolderSeries: Array<SeriesInfoType>;
  queueStatus: QueueStatusType;
  unrecognizedFiles: Array<FileType>;
  unrecognizedMark: Array<string>;
};

const mainpageSlice = createSlice({
  name: 'mainpage',
  initialState: {
    avdump: {},
    fetched: {},
    importFolders: [],
    importFolderSeries: [],
    queueStatus: {} as QueueStatusType,
    selectedImportFolderSeries: 1,
    unrecognizedFiles: [],
    unrecognizedMark: [],
  } as State,
  reducers: {
    setAvdump(sliceState, action) {
      sliceState.avdump = Object.assign({}, sliceState.avdump, action.payload);
    },
    setFetched(sliceState, action) {
      sliceState.fetched = Object.assign({}, sliceState.fetched, { [action.payload]: true });
    },
    setImportFolders(sliceState, action) {
      sliceState.importFolders = action.payload;
    },
    setImportFolderSeries(sliceState, action) {
      sliceState.importFolderSeries = action.payload;
    },
    setQueueStatus(sliceState, action) {
      sliceState.queueStatus = Object.assign({}, sliceState.queueStatus, action.payload);
    },
    setUnrecognizedFiles(sliceState, action) {
      sliceState.unrecognizedFiles = action.payload;
    },
    markUnrecognizedFile(sliceState, action) {
      sliceState.unrecognizedMark = action.payload.state === true ? [...sliceState.unrecognizedMark, action.payload.id] : sliceState.unrecognizedMark.filter(id => id !== action.payload.id);
    },
  },
});

export const {
  setAvdump, setFetched, setImportFolders,
  setImportFolderSeries, setQueueStatus,
  setUnrecognizedFiles, markUnrecognizedFile,
} = mainpageSlice.actions;

export default mainpageSlice.reducer;
