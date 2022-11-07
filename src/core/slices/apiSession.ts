import { createSlice } from '@reduxjs/toolkit';

import { authApi } from '../rtkQuery/authApi';

import type { ApiSessionState } from '../types/api';

const apiSessionSlice = createSlice({
  name: 'apiSession',
  initialState: {
    apikey: '',
    username: '',
    rememberUser: false,
  } as ApiSessionState,
  reducers: {
    unsetDetails(sliceState) {
      return Object.assign({}, sliceState, { apikey: '', username: '', rememberUser: false });
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      authApi.endpoints.postAuth.matchFulfilled,
      (sliceState, action) => {
        return Object.assign({}, sliceState, action.payload);
      },
    );
  },
});

export const { unsetDetails } = apiSessionSlice.actions;

export default apiSessionSlice.reducer;
