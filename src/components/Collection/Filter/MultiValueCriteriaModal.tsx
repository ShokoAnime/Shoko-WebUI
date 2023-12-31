import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { filter, map, pull } from 'lodash';

import Button from '@/components/Input/Button';
import ModalPanel from '@/components/Panels/ModalPanel';
import { setFilterValues } from '@/core/slices/collection';

import type { RootState } from '@/core/store';
import type { FilterExpression } from '@/core/types/api/filter';

type Props = {
  criteria: FilterExpression;
  show: boolean;
  onClose: () => void;
};
const MultiValueCriteriaModal = ({ criteria, onClose, show }: Props) => {
  const dispatch = useDispatch();
  const selectedValues = useSelector(
    (state: RootState) => state.collection.filterValues[criteria.Expression] ?? [],
  );
  const [unsavedValues, setUnsavedValues] = useState([] as string[]);
  const unusedValues = useMemo(
    () =>
      filter(
        criteria.PossibleParameters,
        item => selectedValues.indexOf(item) === -1 && unsavedValues.indexOf(item) === -1,
      ),
    [criteria.PossibleParameters, selectedValues, unsavedValues],
  );

  const selectValue = (value: string) => {
    setUnsavedValues([...unsavedValues, value]);
  };

  const removeValue = (value: string) => {
    if (unsavedValues.indexOf(value) !== -1) {
      setUnsavedValues(pull([...unsavedValues], value));
    }
    if (selectedValues.indexOf(value) !== -1) {
      dispatch(setFilterValues({ [criteria.Expression]: pull([...selectedValues], value) }));
    }
  };

  const handleCancel = () => {
    setUnsavedValues([]);
    onClose();
  };

  const handleSave = () => {
    dispatch(setFilterValues({ [criteria.Expression]: [...selectedValues, ...unsavedValues] }));
    setUnsavedValues([]);
    onClose();
  };

  return (
    <ModalPanel show={show} onRequestClose={onClose} title={`Edit Condition - ${criteria.Name}`} titleLeft>
      <div className="shoko-scrollbar flex max-h-[15rem] flex-col gap-x-2 overflow-auto bg-panel-background-alt">
        {map(unusedValues, value => (
          <div
            onClick={() => {
              selectValue(value);
            }}
            className="p-2"
            key={value}
          >
            {value}
          </div>
        ))}
      </div>
      <div>Selected values</div>
      <div className="shoko-scrollbar flex max-h-[15rem] min-h-[15rem] flex-col gap-x-2 overflow-auto bg-panel-background-alt">
        {map([...selectedValues, ...unsavedValues], value => (
          <div
            className="p-2"
            onClick={() => {
              removeValue(value);
            }}
            key={value}
          >
            {value}
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-x-3 font-semibold">
        <Button onClick={handleCancel} buttonType="secondary" className="px-6 py-2">Cancel</Button>
        <Button
          onClick={handleSave}
          buttonType="primary"
          className="px-6 py-2"
        >
          Save
        </Button>
      </div>
    </ModalPanel>
  );
};

export default MultiValueCriteriaModal;
