import { createSelector, createSlice } from '@reduxjs/toolkit';
import { keys } from 'lodash';

import type { RootState } from '@/core/store';
import type { FilterExpression, FilterTag } from '@/core/types/api/filter';
import type { PayloadAction } from '@reduxjs/toolkit';

type State = {
  filterCriteria: Record<string, FilterExpression>;
  filterConditions: Record<string, boolean>;
  filterValues: Record<string, string[]>;
  filterTags: Record<string, FilterTag[]>;
  activeFilter: object | null;
};

const collectionSlice = createSlice({
  name: 'collection',
  initialState: {
    filterCriteria: {},
    filterConditions: {},
    filterValues: {},
    filterTags: {},
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
    setFilterTag(sliceState, action: PayloadAction<Record<string, FilterTag[]>>) {
      sliceState.filterTags = action.payload;
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
  setFilterTag,
  setFilterValues,
} = collectionSlice.actions;

export const selectFilterTags = createSelector(
  [
    (state: RootState) => state.collection,
    (_, criteria: FilterExpression) => criteria.Expression,
  ],
  (values, expression) => values.filterTags[expression] ?? [],
);

export const selectFilterValues = createSelector(
  [
    (state: RootState) => state.collection,
    (_, criteria: FilterExpression) => criteria.Expression,
  ],
  (values, expression) => values.filterValues[expression] ?? [],
);

export const selectActiveCriteria = createSelector(
  [
    (state: RootState) => state.collection,
  ],
  values => [
    ...keys(values.filterCriteria),
    ...keys(values.filterConditions),
    ...keys(values.filterValues),
    ...keys(values.filterTags),
  ],
);

export default collectionSlice.reducer;
