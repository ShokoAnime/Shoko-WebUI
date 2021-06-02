import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { FolderType } from '../../types/api/folder';

const browseFolderSlice = createSlice({
  name: 'browseFolder',
  initialState: {
    status: false,
    id: 0,
    items: [] as Array<Array<FolderType>>,
    selectedNode: {
      id: 0,
      Path: '',
    },
  },
  reducers: {
    setStatus(sliceState, action: PayloadAction<boolean>) {
      sliceState.status = action.payload;
    },
    setId(sliceState, action: PayloadAction<number>) {
      sliceState.id = action.payload;
    },
    setItems(
      sliceState,
      action: PayloadAction<{ key: number; nodes: Array<FolderType> }>,
    ) {
      const { key, nodes } = action.payload;
      sliceState.items[key] = nodes;
    },
    setSelectedNode(sliceState, action: PayloadAction<typeof sliceState.selectedNode>) {
      sliceState.selectedNode = action.payload;
    },
  },
});

export const {
  setStatus, setId, setItems, setSelectedNode,
} = browseFolderSlice.actions;

export default browseFolderSlice.reducer;
