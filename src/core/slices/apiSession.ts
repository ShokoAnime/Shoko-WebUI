import { createSlice } from '@reduxjs/toolkit';

import type { ApiSessionState } from '@/core/types/api';
import type { PayloadAction } from '@reduxjs/toolkit';

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
    setDetails(sliceState, action: PayloadAction<ApiSessionState>) {
      return { ...sliceState, ...action.payload };
    },
  },
});

export const { setDetails } = apiSessionSlice.actions;

export default apiSessionSlice.reducer;
