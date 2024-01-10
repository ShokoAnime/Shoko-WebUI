import React from 'react';
import { useSelector } from 'react-redux';

import Criteria from '@/components/Collection/Filter/Criteria';
import { selectFilterValues } from '@/core/slices/collection';

import type { RootState } from '@/core/store';
import type { FilterExpression } from '@/core/types/api/filter';

type Props = {
  criteria: FilterExpression;
};

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const MultiValueCriteria = ({ criteria }: Props) => {
  const selectedParameter = useSelector(
    (state: RootState) => selectFilterValues(state, criteria),
  );

  return (
    <Criteria
      criteria={criteria}
      parameterExists={selectedParameter.length > 0}
      transformedParameter={selectedParameter.map(capitalize).join(', ')}
      type="multivalue"
    />
  );
};

export default MultiValueCriteria;
