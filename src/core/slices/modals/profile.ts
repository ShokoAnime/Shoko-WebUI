import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    status: false,
  },
  reducers: {
    setStatus(sliceState, action: PayloadAction<boolean>) {
      sliceState.status = action.payload;
    },
  },
});

export const { setStatus } = profileSlice.actions;

export default profileSlice.reducer;
