import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type State = {
  status: boolean;
};

const  editDashboardSlice = createSlice({
  name: 'editDashboard',
  initialState: {
    status: false,
  } as State,
  reducers: {
    setStatus(sliceState, action: PayloadAction<boolean>) {
      sliceState.status = action.payload;
    },
  },
});

export const { setStatus } = editDashboardSlice.actions;

export default editDashboardSlice.reducer;
