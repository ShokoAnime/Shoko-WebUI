import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { map } from 'lodash';

import Select from '@/components/Input/Select';
import { addFilterCondition } from '@/core/slices/collection';

import type { RootState } from '@/core/store';
import type { FilterExpression } from '@/core/types/api/filter';

type Props = {
  criteria: FilterExpression;
};

const DefaultCriteria = ({ criteria }: Props) => {
  const dispatch = useDispatch();
  const selectedParameter = useSelector(
    (state: RootState) => state.collection.filterConditions[criteria.Expression] ?? '',
  );

  useEffect(() => {
    if (!criteria.PossibleParameters || !criteria?.PossibleParameters[0]) return;
    const value = criteria.PossibleParameters[0] ?? '';
    dispatch(addFilterCondition({ [criteria.Expression]: value }));
  }, [criteria.Expression, criteria.PossibleParameters, dispatch]);

  return (
    <Select
      id={criteria.Expression}
      label={criteria.Name}
      value={selectedParameter}
      onChange={() => {}}
    >
      {map(criteria.PossibleParameters, value => <option key={value} value={value}>{value}</option>)}
    </Select>
  );
};

export default DefaultCriteria;
