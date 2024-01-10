import store from '@/core/store';

import type { FilterCondition, FilterExpression, FilterSeason, FilterTag } from '@/core/types/api/filter';

const buildFilter = (filters: FilterCondition[]): FilterCondition => {
  if (filters.length > 1) {
    return {
      Type: 'And',
      Left: filters[0],
      Right: buildFilter(filters.slice(1)),
    };
  }
  return filters[0];
};

const buildSeasonCondition = (
  condition: FilterSeason,
  type: string,
) => ({ Type: type, Parameter: condition.Year, SecondParameter: condition.Season });

const buildSidebarFilterConditionSeason = (conditionValues: FilterSeason[], type: string): object => {
  if (conditionValues.length > 1) {
    return {
      Type: 'Or',
      Left: buildSeasonCondition(conditionValues[0], type),
      Right: buildSidebarFilterConditionSeason(conditionValues.slice(1), type),
    };
  }
  return buildSeasonCondition(conditionValues[0], type);
};
const buildTagCondition = (
  condition: FilterTag,
  type: string,
) => (condition.isExcluded
  ? { Type: 'Not', Left: { Type: type, Parameter: condition.Name } }
  : { Type: type, Parameter: condition.Name });
const buildSidebarFilterConditionTag = (conditionValues: FilterTag[], type: string): object => {
  if (conditionValues.length > 1) {
    return {
      Type: 'And',
      Left: buildTagCondition(conditionValues[0], type),
      Right: buildSidebarFilterConditionTag(conditionValues.slice(1), type),
    };
  }
  return buildTagCondition(conditionValues[0], type);
};
const buildSidebarFilterConditionMultivalue = (conditionValues: string[], type: string, operator = 'And'): object => {
  if (conditionValues.length > 1) {
    return {
      Type: operator,
      Left: { Type: type, Parameter: conditionValues[0] },
      Right: buildSidebarFilterConditionMultivalue(conditionValues.slice(1), type),
    };
  }
  return { Type: type, Parameter: conditionValues[0] };
};
const buildSidebarFilterCondition = (currentFilter: FilterExpression) => {
  if (currentFilter.Expression === 'HasCustomTag' || currentFilter.Expression === 'HasTag') {
    const tagValues = store.getState().collection.filterTags[currentFilter.Expression];
    return buildSidebarFilterConditionTag(tagValues, currentFilter.Expression);
  }
  if (currentFilter?.PossibleParameters) {
    const filterValues = store.getState().collection.filterValues[currentFilter.Expression];
    return buildSidebarFilterConditionMultivalue(filterValues, currentFilter.Expression);
  }
  if (currentFilter?.Expression === 'InYear') {
    const filterValues = store.getState().collection.filterValues[currentFilter.Expression];
    return buildSidebarFilterConditionMultivalue(filterValues, currentFilter.Expression, 'Or');
  }
  if (currentFilter?.Expression === 'InSeason') {
    const seasonValues = store.getState().collection.filterSeasons[currentFilter.Expression];
    return buildSidebarFilterConditionSeason(seasonValues, currentFilter.Expression);
  }

  const value = store.getState().collection.filterConditions[currentFilter.Expression] ?? true;
  return value ? { Type: currentFilter.Expression } : { Type: 'Not', Left: { Type: currentFilter.Expression } };
};

export const buildSidebarFilter = (filters: FilterExpression[]): object => {
  if (filters.length > 1) {
    return {
      Type: 'And',
      Left: buildSidebarFilterCondition(filters[0]),
      Right: buildSidebarFilter(filters.slice(1)),
    };
  }
  return buildSidebarFilterCondition(filters[0]);
};

export default buildFilter;
