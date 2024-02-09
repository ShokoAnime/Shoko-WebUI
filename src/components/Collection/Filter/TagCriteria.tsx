import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { forEach } from 'lodash';

import Criteria from '@/components/Collection/Filter/Criteria';
import { selectFilterTags } from '@/core/slices/collection';

import type { FilterExpression } from '@/core/types/api/filter';

type TagLineProps = {
  title: string;
  values: string[];
};
const TagLine = ({ title, values }: TagLineProps) => (
  <div className="rounded-lg border border-panel-border bg-panel-input px-4 py-3">
    <div className="line-clamp-3">
      <span className="pr-2 text-panel-text-important">{title}</span>
      {values.join(', ')}
    </div>
  </div>
);

const Parameter = ({ excludedValues, includedValues }: { includedValues: string[], excludedValues: string[] }) => (
  <>
    {includedValues.length > 0 && <TagLine title="Included:" values={includedValues} />}
    {excludedValues.length > 0 && <TagLine title="Excluded:" values={excludedValues} />}
  </>
);

type Props = {
  criteria: FilterExpression;
};

const TagCriteria = ({ criteria }: Props) => {
  const selectedParameter = useSelector(state => selectFilterTags(state, criteria));
  const [includedValues, excludedValues] = useMemo(() => {
    const included: string[] = [];
    const excluded: string[] = [];
    forEach(selectedParameter, (tag) => {
      if (tag.isExcluded) {
        excluded.push(tag.Name);
      } else {
        included.push(tag.Name);
      }
    });
    return [included, excluded];
  }, [selectedParameter]);

  return (
    <Criteria
      criteria={criteria}
      parameterExists={includedValues.length > 0 || excludedValues.length > 0}
      transformedParameter={<Parameter includedValues={includedValues} excludedValues={excludedValues} />}
      type="tag"
    />
  );
};

export default TagCriteria;
