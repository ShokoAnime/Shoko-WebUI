import { createSlice } from '@reduxjs/toolkit';

import type { HashProviderInfoType } from '@/core/react-query/hashing/types';
import type { ReleaseProviderInfoType } from '@/core/react-query/release-info/types';
import type { PayloadAction } from '@reduxjs/toolkit';

const providerInfo = createSlice({
  name: 'providerInfo',
  initialState: {
    show: false,
    provider: undefined as HashProviderInfoType | ReleaseProviderInfoType | undefined,
  },
  reducers: {
    hideProviderInfo(sliceState) {
      sliceState.show = false;
    },
    showProviderInfo(sliceState, action: PayloadAction<HashProviderInfoType | ReleaseProviderInfoType>) {
      sliceState.provider = action.payload;
      sliceState.show = true;
    },
  },
});

export const { hideProviderInfo, showProviderInfo } = providerInfo.actions;

export default providerInfo.reducer;
