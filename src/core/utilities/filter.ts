import { filter } from 'lodash';

import { axios } from '@/core/axios';
import { transformFilterExpressions } from '@/core/react-query/filter/helpers';
import queryClient from '@/core/react-query/queryClient';
import { addFilterCriteria } from '@/core/slices/collection';
import store from '@/core/store';

import type { ExpressionType, FilterCondition, FilterExpression, FilterTag } from '@/core/types/api/filter';

export const buildFilter = (filters: FilterCondition[]): FilterCondition => {
  if (filters.length > 1) {
    return {
      Type: 'And',
      Left: filters[0],
      Right: buildFilter(filters.slice(1)),
    };
  }
  return filters[0];
};

const buildTagCondition = (
  condition: FilterTag,
  type: ExpressionType,
): FilterCondition => (condition.isExcluded
  ? { Type: 'Not', Left: { Type: type, Parameter: condition.Name } }
  : { Type: type, Parameter: condition.Name });
const buildSidebarFilterConditionTag = (conditionValues: FilterTag[], type: ExpressionType): FilterCondition => {
  if (conditionValues.length > 1) {
    return {
      Type: 'And',
      Left: buildTagCondition(conditionValues[0], type),
      Right: buildSidebarFilterConditionTag(conditionValues.slice(1), type),
    };
  }
  return buildTagCondition(conditionValues[0], type);
};
const buildSidebarFilterConditionMultivalue = (
  conditionValues: string[],
  type: ExpressionType,
  operator: 'Or' | 'And' = 'And',
): FilterCondition => {
  if (conditionValues.length > 1) {
    return {
      Type: operator,
      Left: { Type: type, Parameter: conditionValues[0] },
      Right: buildSidebarFilterConditionMultivalue(conditionValues.slice(1), type),
    };
  }
  return { Type: type, Parameter: conditionValues[0] };
};

const buildSidebarFilterConditionMultivaluePair = (
  conditionValues: string[][],
  type: ExpressionType,
  operator: 'Or' | 'And' = 'And',
): FilterCondition => {
  if (conditionValues.length > 1) {
    return {
      Type: operator,
      Left: { Type: type, Parameter: conditionValues[0][0], SecondParameter: conditionValues[0][1] },
      Right: buildSidebarFilterConditionMultivaluePair(conditionValues.slice(1), type),
    };
  }
  return { Type: type, Parameter: conditionValues[0][0], SecondParameter: conditionValues[0][1] };
};

const buildSidebarFilterCondition = (currentFilter: FilterExpression): FilterCondition => {
  if (currentFilter.Expression === 'HasCustomTag' || currentFilter.Expression === 'HasTag') {
    const tagValues = store.getState().collection.filterTags[currentFilter.Expression];
    return buildSidebarFilterConditionTag(tagValues, currentFilter.Expression);
  }
  if (currentFilter?.PossibleParameterPairs) {
    // TODO: Using ': ' as a delimiter, but this might need to be changed in the future.
    // Currently only In Season expression has possible parameter pairs.
    const filterValues = store.getState().collection.filterValues[currentFilter.Expression].map(
      value => value.split(': '),
    );
    const filterMatch = store.getState().collection.filterMatch[currentFilter.Expression] ?? 'Or';
    return buildSidebarFilterConditionMultivaluePair(filterValues, currentFilter.Expression, filterMatch);
  }
  if (currentFilter?.PossibleParameters ?? currentFilter?.Parameter === 'Number') {
    const filterValues = store.getState().collection.filterValues[currentFilter.Expression];
    const filterMatch = store.getState().collection.filterMatch[currentFilter.Expression] ?? 'Or';
    return buildSidebarFilterConditionMultivalue(filterValues, currentFilter.Expression, filterMatch);
  }

  const value = store.getState().collection.filterConditions[currentFilter.Expression] ?? true;
  return value ? { Type: currentFilter.Expression } : { Type: 'Not', Left: { Type: currentFilter.Expression } };
};

export const buildSidebarFilter = (filters: FilterExpression[]): FilterCondition => {
  if (filters.length > 1) {
    return {
      Type: 'And',
      Left: buildSidebarFilterCondition(filters[0]),
      Right: buildSidebarFilter(filters.slice(1)),
    };
  }
  return buildSidebarFilterCondition(filters[0]);
};

export const addFilterCriteriaToStore = async (newCriteria: string) => {
  const allCriteria = transformFilterExpressions(
    await queryClient.fetchQuery<FilterExpression[]>(
      {
        queryKey: ['filter', 'expression', 'all'],
        queryFn: () => axios.get('Filter/Expressions'),
        staleTime: Infinity,
      },
    ),
  );
  const filterExpression = filter(allCriteria, { Expression: newCriteria })[0] as FilterExpression;
  store.dispatch(addFilterCriteria(filterExpression));
};
