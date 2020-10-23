import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const languagesSlice = createSlice({
  name: 'languages',
  initialState: {
    status: false,
  },
  reducers: {
    setStatus(sliceState, action: PayloadAction<boolean>) {
      sliceState.status = action.payload;
    },
  },
});

export const { setStatus } = languagesSlice.actions;

export default languagesSlice.reducer;
