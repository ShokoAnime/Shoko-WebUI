import { axios } from '@/core/axios';
import { transformFilterExpressions } from '@/core/react-query/filter/helpers';
import queryClient from '@/core/react-query/queryClient';
import { setTree } from '@/core/slices/collection';
import store from '@/core/store';
import { createLeafNode, generateNodeId } from '@/core/utilities/filterTree';

import type { FilterCondition, FilterExpression, LeafValue } from '@/core/types/api/filter';

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

// Replaces the entire sidebar filter with a single condition, used by "quick filter"
// entry points elsewhere in the app (e.g. clicking a tag, or a dashboard stat) that jump
// straight to the live collection filter pre-populated with one criterion.
export const startQuickFilter = async (expressionType: string, valueOverride?: LeafValue) => {
  const allCriteria = transformFilterExpressions(
    await queryClient.fetchQuery<FilterExpression[]>(
      {
        queryKey: ['filter', 'expression', 'all'],
        queryFn: () => axios.get('Filter/Expressions'),
        staleTime: Infinity,
      },
    ),
  );
  const entry = allCriteria.find(item => item.Expression === expressionType);
  if (!entry) return;

  const leaf = createLeafNode(entry);
  if (valueOverride) leaf.value = valueOverride;

  store.dispatch(setTree({ id: generateNodeId(), kind: 'group', operator: 'And', negate: false, children: [leaf] }));
};
