import { filter, sortBy } from 'lodash';

import type { FilterExpression } from '@/core/types/api/filter';

const isFilterCondition = (item: unknown): item is FilterExpression =>
  typeof (item as FilterExpression)?.Expression !== 'undefined';

export const transformFilterExpressions = (response: FilterExpression[]) => {
  const expressions = filter(response, item => isFilterCondition(item) && item.Group === 'Info');
  return sortBy(expressions, 'Name');
};
