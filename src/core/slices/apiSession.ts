import { createSlice } from '@reduxjs/toolkit';
import Version from '../../../public/version.json';

import { authApi } from '@/core/rtkQuery/splitApi/authApi';

import type { ApiSessionState } from '@/core/types/api';

const apiSessionSlice = createSlice({
  name: 'apiSession',
  initialState: {
    apikey: '',
    username: '',
    rememberUser: false,
    version: Version.package,
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
