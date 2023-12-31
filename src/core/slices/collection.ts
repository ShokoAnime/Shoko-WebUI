import { createSlice } from '@reduxjs/toolkit';

import type { FilterExpression } from '@/core/types/api/filter';
import type { PayloadAction } from '@reduxjs/toolkit';

type State = {
  filterCriteria: Record<string, FilterExpression>;
  filterConditions: Record<string, string>;
  filterValues: Record<string, string[]>;
  activeFilter: object | null;
};

const collectionSlice = createSlice({
  name: 'collection',
  initialState: {
    filterCriteria: {},
    filterConditions: {},
    filterValues: {},
    activeFilter: null,
  } as State,
  reducers: {
    addFilterCriteria(sliceState, action: PayloadAction<FilterExpression>) {
      const expression = action.payload;
      sliceState.filterCriteria[expression.Expression] = expression;
    },
    addFilterCondition(sliceState, action: PayloadAction<Record<string, string>>) {
      sliceState.filterConditions = { ...sliceState.filterConditions, ...action.payload };
    },
    setFilterValues(sliceState, action: PayloadAction<Record<string, string[]>>) {
      sliceState.filterValues = { ...sliceState.filterValues, ...action.payload };
    },
    setActiveFilter(sliceState, action: PayloadAction<object>) {
      sliceState.activeFilter = action.payload;
    },
    resetActiveFilter(sliceState) {
      sliceState.activeFilter = null;
    },
  },
});

export const {
  addFilterCondition,
  addFilterCriteria,
  resetActiveFilter,
  setActiveFilter,
  setFilterValues,
} = collectionSlice.actions;

export default collectionSlice.reducer;
