import { createSlice } from '@reduxjs/toolkit';

import type { RenamerResultType } from '@/core/react-query/renamer/types';
import type { FileType } from '@/core/types/api/file';
import type { PayloadAction } from '@reduxjs/toolkit';

type State = {
  files: FileType[];
  renameResults: Record<number, RenamerResultType>;
};

const renamerSlice = createSlice({
  name: 'renamer',
  initialState: {
    files: [],
    renameResults: {},
  } as State,
  reducers: {
    addFiles(sliceState, action: PayloadAction<FileType[]>) {
      const existingFileIds = sliceState.files.map(file => file.ID);
      const newFiles = action.payload.filter(file => !existingFileIds.includes(file.ID));
      sliceState.files.push(...newFiles);
    },
    clearFiles(sliceState) {
      sliceState.files = [];
      sliceState.renameResults = {};
    },
    removeFiles(sliceState, action: PayloadAction<number[]>) {
      sliceState.files = sliceState.files.filter(file => !action.payload.includes(file.ID));
    },
    updateFiles(sliceState, action: PayloadAction<RenamerResultType[]>) {
      action.payload.forEach((result) => {
        const file = sliceState.files.find(item => item.ID === result.FileID);
        if (!file) return;
        if (result.RelativePath) file.Locations[0].RelativePath = result.RelativePath;
        if (result.AbsolutePath) file.Locations[0].AbsolutePath = result.AbsolutePath;
        if (result.ImportFolderID) file.Locations[0].ImportFolderID = result.ImportFolderID;
      });
    },
    addRenameResults(sliceState, action: PayloadAction<Record<number, RenamerResultType>>) {
      sliceState.renameResults = {
        ...sliceState.renameResults,
        ...action.payload,
      };
    },
    clearRenameResults(sliceState) {
      sliceState.renameResults = {};
    },
  },
});

export const {
  addFiles,
  addRenameResults,
  clearFiles,
  clearRenameResults,
  removeFiles,
  updateFiles,
} = renamerSlice.actions;

export default renamerSlice.reducer;
