import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const browseFolderSlice = createSlice({
  name: 'browseFolder',
  initialState: {
    status: false,
    id: 0,
    items: [] as Array<any>,
    selectedNode: {
      id: 0,
      path: '',
    },
  },
  reducers: {
    setStatus(sliceState, action: PayloadAction<boolean>) {
      sliceState.status = action.payload;
    },
    setId(sliceState, action: PayloadAction<number>) {
      sliceState.id = action.payload;
    },
    setItems(sliceState, action: PayloadAction<any>) {
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
