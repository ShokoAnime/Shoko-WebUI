import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { mdiCircleEditOutline } from '@mdi/js';
import { Icon } from '@mdi/react';

import MultiValueCriteriaModal from '@/components/Collection/Filter/MultiValueCriteriaModal';

import type { RootState } from '@/core/store';
import type { FilterExpression } from '@/core/types/api/filter';

type Props = {
  criteria: FilterExpression;
};

const MultiValueCriteria = ({ criteria }: Props) => {
  const [showModal, setShowModal] = useState(false);
  const selectedParameter = useSelector(
    (state: RootState) => state.collection.filterValues[criteria.Expression] ?? '',
  );

  return (
    <>
      <div className="flex flex-col">
        <div className="mb-3 flex items-center justify-between">
          <div className="font-semibold">
            {criteria.Name}
          </div>
          <div>
            <div
              onClick={() => {
                setShowModal(true);
              }}
            >
              <Icon className="cursor-pointer text-panel-text-primary" path={mdiCircleEditOutline} size={1} />
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
