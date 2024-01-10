import React from 'react';
import { useSelector } from 'react-redux';

import Criteria from '@/components/Collection/Filter/Criteria';
import { selectFilterSeasons } from '@/core/slices/collection';

import type { RootState } from '@/core/store';
import type { FilterExpression } from '@/core/types/api/filter';

type Props = {
  criteria: FilterExpression;
};

const SeasonCriteria = ({ criteria }: Props) => {
  const selectedParameter = useSelector(
    (state: RootState) => selectFilterSeasons(state, criteria),
  );

  return (
    <Criteria
      criteria={criteria}
      parameterExists={selectedParameter.length > 0}
      transformedParameter={selectedParameter.map(season => `${season.Season} ${season.Year}`).join(', ')}
      type="season"
    />
  );
};

export default SeasonCriteria;
