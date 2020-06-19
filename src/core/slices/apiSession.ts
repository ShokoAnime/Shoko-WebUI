import { createSlice } from '@reduxjs/toolkit';

const apiSessionSlice = createSlice({
  name: 'apiSession',
  initialState: {
    apikey: '',
    username: '',
    rememberUser: false,
  },
  reducers: {
    setDetails(sliceState, action) {
      return Object.assign(sliceState, action.payload);
    },
    unsetDetails(sliceState) {
      return Object.assign(sliceState, { apikey: '', username: '', rememberUser: false });
    },
  },
});

export const { setDetails, unsetDetails } = apiSessionSlice.actions;

export default apiSessionSlice.reducer;
