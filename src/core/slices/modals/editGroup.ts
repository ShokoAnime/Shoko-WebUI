import { createSlice } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';

const editGroupSlice = createSlice({
  name: 'editGroup',
  initialState: {
    groupId: -1,
  },
  reducers: {
    setGroupId(sliceState, action: PayloadAction<number>) {
      sliceState.groupId = action.payload;
    },
  },
});

export const { setGroupId } = editGroupSlice.actions;

export default editGroupSlice.reducer;
