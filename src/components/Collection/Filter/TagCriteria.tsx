import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { mdiCircleEditOutline, mdiMinusCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { forEach } from 'lodash';
import { useEffectOnce } from 'usehooks-ts';

import TagCriteriaModal from '@/components/Collection/Filter/TagCriteriaModal';
import { removeFilterCriteria, selectFilterTags } from '@/core/slices/collection';
import useEventCallback from '@/hooks/useEventCallback';

import type { FilterExpression } from '@/core/types/api/filter';

type TagLineProps = {
  title: string;
  values: string[];
};
const TagLine = ({ title, values }: TagLineProps) => (
  <div className="bg-panel-background-alt px-4 py-3">
    <div className="line-clamp-3">
      <span className="pr-2 text-panel-text-important">{title}</span>
      {values.join(', ')}
    </div>
  </div>
);

type Props = {
  criteria: FilterExpression;
};

const TagCriteria = ({ criteria }: Props) => {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
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

  const showModalCallback = useEventCallback(() => {
    setShowModal(true);
  });

  const removeCriteria = useEventCallback(() => {
    dispatch(removeFilterCriteria(criteria));
  });

  useEffectOnce(() => {
    if (includedValues.length > 0 || excludedValues.length > 0) return;
    setShowModal(true);
  });

  return (
    <>
      <div className="flex flex-col">
        <div className="mb-3 flex items-center justify-between">
          <div className="font-semibold">
            {criteria.Name}
          </div>
          <div className="flex gap-2">
            <div onClick={showModalCallback}>
              <Icon className="cursor-pointer text-panel-text-primary" path={mdiCircleEditOutline} size={1} />
            </div>
            <div onClick={removeCriteria}>
              <Icon className="cursor-pointer text-panel-icon-danger" path={mdiMinusCircleOutline} size={1} />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-y-2">
          {includedValues.length > 0 && <TagLine title="Included:" values={includedValues} />}
          {excludedValues.length > 0 && <TagLine title="Excluded:" values={excludedValues} />}
        </div>
      </div>
      <TagCriteriaModal
        criteria={criteria}
        show={showModal}
        onClose={() => {
          setShowModal(false);
        }}
        removeCriteria={removeCriteria}
      />
    </>
  );
};

export default TagCriteria;
