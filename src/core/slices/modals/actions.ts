import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type State = {
  status: boolean;
};

const  actionsSlice = createSlice({
  name: 'filters',
  initialState: {
    filters: [],
    status: false,
  } as State,
  reducers: {
    setStatus(sliceState, action: PayloadAction<boolean>) {
      sliceState.status = action.payload;
    },
  },
});

export const { setStatus } = actionsSlice.actions;

export default actionsSlice.reducer;