import { createSlice } from '@reduxjs/toolkit';

import type { FilterExpression } from '@/core/types/api/filter';
import type { PayloadAction } from '@reduxjs/toolkit';

type State = {
  filterCriteria: Record<string, FilterExpression>;
  filterConditions: Record<string, string>;
};

const collectionSlice = createSlice({
  name: 'collection',
  initialState: {
    filterCriteria: {},
    filterConditions: {},
  } as State,
  reducers: {
    addFilterCriteria(sliceState, action: PayloadAction<FilterExpression>) {
      const expression = action.payload;
      sliceState.filterCriteria[expression.Expression] = expression;
    },
    addFilterCondition(sliceState, action: PayloadAction<Record<string, string>>) {
      sliceState.filterConditions = { ...sliceState.filterConditions, ...action.payload };
    },
  },
});

export const { addFilterCondition, addFilterCriteria } = collectionSlice.actions;

export default collectionSlice.reducer;
