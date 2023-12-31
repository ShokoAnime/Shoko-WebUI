import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { mdiCircleEditOutline, mdiMinusCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';

import MultiValueCriteriaModal from '@/components/Collection/Filter/MultiValueCriteriaModal';
import { removeFilterCriteria } from '@/core/slices/collection';

import type { RootState } from '@/core/store';
import type { FilterExpression } from '@/core/types/api/filter';

type Props = {
  criteria: FilterExpression;
};

const MultiValueCriteria = ({ criteria }: Props) => {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const selectedParameter = useSelector(
    (state: RootState) => state.collection.filterValues[criteria.Expression] ?? [],
  );

  const showModalCallback = () => () => {
    setShowModal(true);
  };

  const removeCriteria = () => () => {
    dispatch(removeFilterCriteria(criteria));
  };

  return (
    <>
      <div className="flex flex-col">
        <div className="mb-3 flex items-center justify-between">
          <div className="font-semibold">
            {criteria.Name}
          </div>
          <div className="flex gap-2">
            <div onClick={showModalCallback()}>
              <Icon className="cursor-pointer text-panel-text-primary" path={mdiCircleEditOutline} size={1} />
            </div>
            <div onClick={removeCriteria()}>
              <Icon className="cursor-pointer text-panel-icon-danger" path={mdiMinusCircleOutline} size={1} />
            </div>
          </div>
        </div>
        <div className="line-clamp-1 bg-panel-background-alt p-2">{selectedParameter.join(', ')}</div>
      </div>
      <MultiValueCriteriaModal
        criteria={criteria}
        show={showModal}
        onClose={() => {
          setShowModal(false);
        }}
      />
    </>
  );
};

export default MultiValueCriteria;
