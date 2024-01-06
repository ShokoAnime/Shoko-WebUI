import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { mdiCircleEditOutline, mdiMinusCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { forEach } from 'lodash';

import TagCriteriaModal from '@/components/Collection/Filter/TagCriteriaModal';
import { removeFilterCriteria, selectFilterTags } from '@/core/slices/collection';

import type { FilterExpression } from '@/core/types/api/filter';

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
        <div className="line-clamp-1 flex gap-x-2 whitespace-nowrap bg-panel-background-alt p-2">
          {includedValues && (
            <div>
              <span className="text-panel-text-important pr-2">Included:</span>
              {includedValues.join(', ')}
            </div>
          )}
          {excludedValues && (
            <div>
              <span className="text-panel-text-important pr-2">Excluded:</span>
              {excludedValues.join(', ')}
            </div>
          )}
        </div>
      </div>
      <TagCriteriaModal
        criteria={criteria}
        show={showModal}
        onClose={() => {
          setShowModal(false);
        }}
      />
    </>
  );
};

export default TagCriteria;
