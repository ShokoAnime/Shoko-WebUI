import { createSelector, createSlice } from '@reduxjs/toolkit';
import { filter, keys } from 'lodash';

import type { RootState } from '@/core/store';
import type { FilterExpression, FilterTag } from '@/core/types/api/filter';
import type { PayloadAction } from '@reduxjs/toolkit';

/*
Sidebar filter

Naming these needs some improvements.
Uses expressions received from server:
filterCriteria - when user selects an expression it is copied here, then passed into relevant controls

Values for the condition that user selected, key is criteria.Expression, split by type, technically could be a single array
filterConditions - DefaultCriteria
filterValues - MultiValueCriteria
filterTags - TagCriteria

activeFilter - actual filter expression is generated from all the values it is put here, if it is null filter is not active
*/

type State = {
  filterCriteria: Record<string, FilterExpression>;
  filterConditions: Record<string, boolean>;
  filterValues: Record<string, string[]>;
  filterTags: Record<string, FilterTag[]>;
  filterMatch: Record<string, 'Or' | 'And'>;
  activeFilter: object | null;
};

const initialState = {
  filterCriteria: {},
  filterConditions: {},
  filterValues: {},
  filterTags: {},
  filterMatch: {},
  activeFilter: null,
} as State;

const collectionSlice = createSlice({
  name: 'collection',
  initialState,
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
      if (sliceState.filterTags[Expression] !== undefined) {
        delete sliceState.filterTags[Expression];
      }
      if (sliceState.filterMatch[Expression] !== undefined) {
        delete sliceState.filterMatch[Expression];
      }
    },
    resetFilter() {
      return initialState;
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
    setFilterMatch(sliceState, action: PayloadAction<Record<string, 'Or' | 'And'>>) {
      sliceState.filterMatch = { ...sliceState.filterMatch, ...action.payload };
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
  resetFilter,
  setActiveFilter,
  setFilterMatch,
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
  values => keys(values.filterCriteria),
);

export const selectActiveCriteriaWithValues = createSelector(
  [
    (state: RootState) => state.collection.filterConditions,
    (state: RootState) => state.collection.filterValues,
    (state: RootState) => state.collection.filterTags,
  ],
  (filterConditions, filterValues, filterTags) => [
    ...keys(filter(filterConditions, item => item !== undefined)),
    ...keys(filter(filterValues, item => item.length > 0)),
    ...keys(filter(filterTags, item => item.length > 0)),
  ],
);

export const selectFilterMatch = createSelector(
  [
    (state: RootState) => state.collection.filterMatch,
    (_, expression: string) => expression,
  ],
  (filterMatch, expression) => filterMatch[expression] ?? 'Or',
);

export default collectionSlice.reducer;
