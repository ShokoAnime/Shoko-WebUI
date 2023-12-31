import { useMemo } from 'react';
import { filter } from 'lodash';

import { useFilterExpressionsQuery } from '@/core/react-query/filter/queries';

import type { FilterExpression } from '@/core/types/api/filter';

const isFilterCondition = (item: unknown): item is FilterExpression =>
  typeof (item as FilterExpression)?.Expression !== 'undefined';
export const useFilterExpressionMain = (enabled: boolean) => {
  const expressions = useFilterExpressionsQuery(enabled);
  return useMemo(
    () => filter(expressions.data, item => isFilterCondition(item) && item.Group === 'Info'),
    [expressions.data],
  );
};
