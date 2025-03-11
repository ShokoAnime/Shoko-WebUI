import { createSlice } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';

const managedFolderSlice = createSlice({
  name: 'managedFolder',
  initialState: {
    status: false,
    edit: false,
    ID: 0,
  },
  reducers: {
    setEdit(sliceState, action: PayloadAction<number>) {
      sliceState.edit = true;
      sliceState.ID = action.payload;
      sliceState.status = true;
    },
    setStatus(sliceState, action: PayloadAction<boolean>) {
      sliceState.edit = false;
      sliceState.ID = 0;
      sliceState.status = action.payload;
    },
  },
});

export const { setEdit, setStatus } = managedFolderSlice.actions;

export default managedFolderSlice.reducer;
