import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { FilterType } from '@/core/types/api/common';

type State = {
  filters: Array<FilterType>;
  status: boolean;
};

const  filtersSlice = createSlice({
  name: 'filters',
  initialState: {
    filters: [],
    status: false,
  } as State,
  reducers: {
    setFilters(sliceState, action: PayloadAction<[]>) {
      sliceState.filters = action.payload;
    },
    setStatus(sliceState, action: PayloadAction<boolean>) {
      sliceState.status = action.payload;
    },
  },
});

export const { setStatus, setFilters } = filtersSlice.actions;

export default filtersSlice.reducer;