import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { mdiCircleEditOutline, mdiMinusCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';

import { removeFilterCriteria, selectFilterValues } from '@/core/slices/collection';

import YearCriteriaModal from './YearCriteriaModal';

import type { RootState } from '@/core/store';
import type { FilterExpression } from '@/core/types/api/filter';

type Props = {
  criteria: FilterExpression;
};

const YearCriteria = ({ criteria }: Props) => {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const selectedParameter = useSelector(
    (state: RootState) => selectFilterValues(state, criteria),
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
        <div className="flex flex-col gap-y-2">
          <div className="bg-panel-background-alt px-4 py-3">
            <div className="line-clamp-1">
              {selectedParameter.join(', ')}
            </div>
          </div>
        </div>
      </div>
      <YearCriteriaModal
        criteria={criteria}
        show={showModal}
        onClose={() => {
          setShowModal(false);
        }}
      />
    </>
  );
};

export default YearCriteria;
