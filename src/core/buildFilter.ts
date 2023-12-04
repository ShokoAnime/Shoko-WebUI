import type { FilterCondition } from '@/core/types/api/filter';

const buildFilter = (filters: FilterCondition[]) => {
  if (filters.length > 1) {
    return {
      Type: 'And',
      Left: filters[0],
      Right: buildFilter(filters.slice(1)),
    };
  }
  return filters[0];
};

export default buildFilter;
