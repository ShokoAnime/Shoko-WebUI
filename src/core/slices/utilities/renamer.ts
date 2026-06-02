import { createSlice } from '@reduxjs/toolkit';

import type { FileType } from '@/core/types/api/file';
import type { RelocationResultType } from '@/core/types/api/relocation';
import type { PayloadAction } from '@reduxjs/toolkit';

type State = {
  files: FileType[];
  results: Record<number, RelocationResultType>;
};

const renamerSlice = createSlice({
  name: 'renamer',
  initialState: {
    files: [],
    results: {},
  } as State,
  reducers: {
    addFiles(sliceState, action: PayloadAction<FileType[]>) {
      const existingFileIds = sliceState.files.map(file => file.ID);
      const newFiles = action.payload.filter(file => !existingFileIds.includes(file.ID));
      sliceState.files.push(...newFiles);
    },
    clearFiles(sliceState) {
      sliceState.files = [];
      sliceState.results = {};
    },
    removeFiles(sliceState, action: PayloadAction<number[]>) {
      sliceState.files = sliceState.files.filter(file => !action.payload.includes(file.ID));
    },
    updateFiles(sliceState, action: PayloadAction<RelocationResultType[]>) {
      action.payload.forEach((result) => {
        const file = sliceState.files.find(item => item.ID === result.FileID);
        if (!file) return;
        if (result.RelativePath) file.Locations[0].RelativePath = result.RelativePath;
        if (result.AbsolutePath) file.Locations[0].AbsolutePath = result.AbsolutePath;
        if (result.ManagedFolderID) file.Locations[0].ManagedFolderID = result.ManagedFolderID;
      });
    },
    addResults(sliceState, action: PayloadAction<Record<number, RelocationResultType>>) {
      sliceState.results = {
        ...sliceState.results,
        ...action.payload,
      };
    },
    clearResults(sliceState) {
      sliceState.results = {};
    },
  },
});

export const {
  addFiles,
  addResults,
  clearFiles,
  clearResults,
  removeFiles,
  updateFiles,
} = renamerSlice.actions;

export default renamerSlice.reducer;
