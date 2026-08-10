import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { mdiCircleEditOutline, mdiMinusCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import MultiValueCriteriaModal from '@/components/Collection/Filter/MultiValueCriteriaModal';
import TagCriteriaModal from '@/components/Collection/Filter/TagCriteriaModal';

import type { FilterExpression, LeafNode } from '@/core/types/api/filter';

type ModalType = 'multivalue' | 'tag';

type Props = {
  catalogEntry: FilterExpression;
  node: LeafNode;
  onRemove: () => void;
  onToggleNegate?: () => void;
  parameterExists: boolean;
  transformedParameter: ReactNode;
  type: ModalType;
};

const getModalComponent = (type: ModalType) => (type === 'multivalue' ? MultiValueCriteriaModal : TagCriteriaModal);

const ParameterList = ({ match, value }: { match: 'And' | 'Or', value: string }) => (
  <div className="line-clamp-2">
    <span className="pr-2 text-panel-text-important">{match === 'Or' ? 'In:' : 'All:'}</span>
    {value}
  </div>
);

const Criteria = (
  { catalogEntry, node, onRemove, onToggleNegate, parameterExists, transformedParameter, type }: Props,
) => {
  const [showModal, setShowModal] = useState(false);

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    if (parameterExists) return;
    setShowModal(true);
  }, [parameterExists]);

  const Modal = useMemo(() => getModalComponent(type), [type]);
  const match = node.value.kind === 'multi' || node.value.kind === 'multiPair' ? node.value.match : 'Or';

  return (
    <>
      <div className="flex flex-col">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-x-2 font-semibold">
            {onToggleNegate && (
              <span
                className={cx(
                  'cursor-pointer rounded-sm border px-1.5 text-xs',
                  node.negate
                    ? 'border-panel-icon-danger text-panel-icon-danger'
                    : 'border-panel-border text-panel-text-important',
                )}
                onClick={onToggleNegate}
                data-tooltip-id="tooltip"
                data-tooltip-content="Toggle NOT"
                data-tooltip-delay-show={500}
              >
                NOT
              </span>
            )}
            {catalogEntry.Name}
          </div>
          <div className="flex gap-x-2">
            <div onClick={openModal}>
              <Icon
                className="cursor-pointer text-panel-text-primary"
                path={mdiCircleEditOutline}
                size={1}
                data-tooltip-id="tooltip"
                data-tooltip-content="Edit Criteria"
                data-tooltip-delay-show={500}
              />
            </div>
            <div onClick={onRemove}>
              <Icon
                className="cursor-pointer text-panel-icon-danger"
                path={mdiMinusCircleOutline}
                size={1}
                data-tooltip-id="tooltip"
                data-tooltip-content="Remove Criteria"
                data-tooltip-delay-show={500}
              />
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
                <ParameterList match={match} value={transformedParameter} />
              </div>
            )
            : transformedParameter}
        </div>
      </div>
      <Modal
        catalogEntry={catalogEntry}
        node={node}
        show={showModal}
        onClose={closeModal}
        onRemove={onRemove}
      />
    </>
  );
};

export default Criteria;
