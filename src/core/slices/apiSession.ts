import { createSlice } from '@reduxjs/toolkit';

import { getUiVersion } from '@/core/util';

import type { ApiSessionState } from '@/core/types/api';
import type { PayloadAction } from '@reduxjs/toolkit';

const initialState: ApiSessionState = {
  apikey: '',
  username: '',
  rememberUser: false,
  version: getUiVersion(),
};

const apiSessionSlice = createSlice({
  name: 'apiSession',
  initialState,
  reducers: {
    setDetails(sliceState, action: PayloadAction<ApiSessionState>) {
      return { ...sliceState, ...action.payload };
    },
  },
});

export const { setDetails } = apiSessionSlice.actions;

export default apiSessionSlice.reducer;
