import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { mdiCircleEditOutline, mdiMinusCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';

import MultiValueCriteriaModal from '@/components/Collection/Filter/MultiValueCriteriaModal';
import TagCriteriaModal from '@/components/Collection/Filter/TagCriteriaModal';
import { removeFilterCriteria, selectFilterMatch } from '@/core/slices/collection';
import useEventCallback from '@/hooks/useEventCallback';

import type { RootState } from '@/core/store';
import type { FilterExpression } from '@/core/types/api/filter';

type ModalType = 'tag' | 'multivalue';

type Props = {
  criteria: FilterExpression;
  parameterExists: boolean;
  transformedParameter: React.ReactNode;
  type: ModalType;
};

const getModalComponent = (type: ModalType) => {
  switch (type) {
    case 'multivalue':
      return MultiValueCriteriaModal;
    case 'tag':
    default:
      return TagCriteriaModal;
  }
};

const ParameterList = ({ expression, value }: { expression: string, value: string }) => {
  const filterMatch = useSelector((state: RootState) => selectFilterMatch(state, expression));

  return (
    <div className="line-clamp-2">
      <span className="pr-2 text-panel-text-important">{filterMatch === 'Or' ? 'In:' : 'All:'}</span>
      {value}
    </div>
  );
};

const Criteria = ({ criteria, parameterExists, transformedParameter, type }: Props) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const openModal = useEventCallback(() => {
    setShowModal(true);
  });

  const closeModal = useEventCallback(() => {
    setShowModal(false);
  });

  const removeCriteria = useEventCallback(() => {
    dispatch(removeFilterCriteria(criteria));
  });

  useEffect(() => {
    if (parameterExists) {
      navigate('/webui/collection', { replace: true, state: { isFilterLink: false } });
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!location.state?.isFilterLink) setShowModal(true);
    // locate/navigate are only used to check/clear the tag link state, adding it to the deps would cause them to loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parameterExists]);

  const Modal = useMemo(() => getModalComponent(type), [type]);

  return (
    <>
      <div className="flex flex-col">
        <div className="mb-3 flex items-center justify-between">
          <div className="font-semibold">
            {criteria.Name}
          </div>
          <div className="flex gap-x-2">
            <div onClick={openModal}>
              <Icon className="cursor-pointer text-panel-text-primary" path={mdiCircleEditOutline} size={1} />
            </div>
            <div onClick={removeCriteria}>
              <Icon className="cursor-pointer text-panel-icon-danger" path={mdiMinusCircleOutline} size={1} />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-y-2">
          {typeof transformedParameter === 'string'
            ? (
              <div
                className="flex cursor-pointer rounded-lg border border-panel-border bg-panel-input px-4 py-3"
                onClick={openModal}
              >
                <ParameterList expression={criteria.Expression} value={transformedParameter} />
              </div>
            )
            : transformedParameter}
        </div>
      </div>
      <Modal
        criteria={criteria}
        show={showModal}
        onClose={closeModal}
        removeCriteria={removeCriteria}
      />
    </>
  );
};

export default Criteria;
