import { createSlice } from '@reduxjs/toolkit';

import { authApi } from '@/core/rtkQuery/splitApi/authApi';

import type { ApiSessionState } from '@/core/types/api';

const { VITE_APPVERSION } = import.meta.env;

const apiSessionSlice = createSlice({
  name: 'apiSession',
  initialState: {
    apikey: '',
    username: '',
    rememberUser: false,
    version: VITE_APPVERSION,
  } as ApiSessionState,
  reducers: {
    unsetDetails(sliceState) {
      return Object.assign({}, sliceState, { apikey: '', username: '', rememberUser: false });
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      authApi.endpoints.postAuth.matchFulfilled,
      (sliceState, action) => Object.assign({}, sliceState, action.payload),
    );
  },
});

export const { unsetDetails } = apiSessionSlice.actions;

export default apiSessionSlice.reducer;
