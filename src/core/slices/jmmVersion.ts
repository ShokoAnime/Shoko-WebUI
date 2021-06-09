import { createSlice } from '@reduxjs/toolkit';

const jmmVersionSlice = createSlice({
  name: 'jmmVersion',
  initialState: '',
  reducers: {
    version(sliceState, action) {
      return action.payload ? sliceState : action.payload;
    },
  },
});

export const { version } = jmmVersionSlice.actions;

export default jmmVersionSlice.reducer;