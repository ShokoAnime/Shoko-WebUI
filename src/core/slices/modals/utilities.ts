import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type State = {
  status: boolean;
};

const  utilitiesSlice = createSlice({
  name: 'utilities',
  initialState: {
    status: false,
  } as State,
  reducers: {
    setStatus(sliceState, action: PayloadAction<boolean>) {
      sliceState.status = action.payload;
    },
  },
});

export const { setStatus } = utilitiesSlice.actions;

export default utilitiesSlice.reducer;
