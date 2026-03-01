import { createSlice } from '@reduxjs/toolkit';

import { getUiVersion } from '@/core/util';

import type { ApiSessionState } from '@/core/types/api';
import type { PayloadAction } from '@reduxjs/toolkit';

const apiSessionSlice = createSlice({
  name: 'apiSession',
  initialState: {
    apikey: '',
    username: '',
    rememberUser: false,
    version: getUiVersion(),
  } as ApiSessionState,
  reducers: {
    setDetails(sliceState, action: PayloadAction<ApiSessionState>) {
      return { ...sliceState, ...action.payload };
    },
  },
});

export const { setDetails } = apiSessionSlice.actions;

export default apiSessionSlice.reducer;
