import { createSlice } from '@reduxjs/toolkit';

import type { FilterExpression } from '@/core/types/api/filter';
import type { PayloadAction } from '@reduxjs/toolkit';

type State = {
  filterCriteria: Record<string, FilterExpression>;
  filterConditions: Record<string, boolean>;
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
    removeFilterCriteria(sliceState, action: PayloadAction<FilterExpression>) {
      const { Expression } = action.payload;
      delete sliceState.filterCriteria[Expression];
      if (sliceState.filterConditions[Expression] !== undefined) {
        delete sliceState.filterConditions[Expression];
      }
      if (sliceState.filterValues[Expression] !== undefined) {
        delete sliceState.filterValues[Expression];
      }
    },
    addFilterCondition(sliceState, action: PayloadAction<Record<string, boolean>>) {
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
  removeFilterCriteria,
  resetActiveFilter,
  setActiveFilter,
  setFilterValues,
} = collectionSlice.actions;

export default collectionSlice.reducer;
