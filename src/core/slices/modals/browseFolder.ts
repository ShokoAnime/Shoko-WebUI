import { createSlice } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';

const browseFolderSlice = createSlice({
  name: 'browseFolder',
  initialState: {
    status: false,
    selectedNode: {
      id: -1,
      Path: '',
    },
  },
  reducers: {
    setStatus(sliceState, action: PayloadAction<boolean>) {
      sliceState.status = action.payload;
    },
    setSelectedNode(sliceState, action: PayloadAction<typeof sliceState.selectedNode>) {
      sliceState.selectedNode = action.payload;
    },
  },
});

export const {
  setSelectedNode,
  setStatus,
} = browseFolderSlice.actions;

export default browseFolderSlice.reducer;
