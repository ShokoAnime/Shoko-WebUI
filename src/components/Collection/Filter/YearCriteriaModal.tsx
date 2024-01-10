import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { mdiMinusCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { map, pull } from 'lodash';

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import ModalPanel from '@/components/Panels/ModalPanel';
import toast from '@/components/Toast';
import { selectFilterValues, setFilterValues } from '@/core/slices/collection';
import useEventCallback from '@/hooks/useEventCallback';

import type { FilterExpression } from '@/core/types/api/filter';

type Props = {
  criteria: FilterExpression;
  show: boolean;
  onClose: () => void;
  removeCriteria: () => void;
};
const YearCriteriaModal = ({ criteria, onClose, removeCriteria, show }: Props) => {
  const dispatch = useDispatch();
  const [addValue, setAddValue] = useState('');
  const selectedValues = useSelector(state => selectFilterValues(state, criteria));
  const [unsavedValues, setUnsavedValues] = useState<string[]>([]);

  const combinedSelectedValues = useMemo(
    () => [...selectedValues, ...unsavedValues],
    [selectedValues, unsavedValues],
  );

  const removeValue = (year: string) => () => {
    if (unsavedValues.indexOf(year) !== -1) {
      setUnsavedValues(pull([...unsavedValues], year));
    }
    if (selectedValues.indexOf(year) !== -1) {
      dispatch(setFilterValues({ [criteria.Expression]: pull([...selectedValues], year) }));
    }
  };

  const handleCancel = useEventCallback(() => {
    setUnsavedValues([]);
    if (selectedValues.length === 0) removeCriteria();
    onClose();
  });

  const handleSave = useEventCallback(() => {
    dispatch(setFilterValues({ [criteria.Expression]: [...selectedValues, ...unsavedValues] }));
    setUnsavedValues([]);
    onClose();
  });

  const handleAddYear = useEventCallback(() => {
    const isYear = /^\d{4}$/.test(addValue);
    if (!isYear) {
      toast.error('Value is not a year!');
      return;
    }
    if (unsavedValues.indexOf(addValue) !== -1 || selectedValues.indexOf(addValue) !== -1) {
      return;
    }
    setUnsavedValues([...unsavedValues, addValue]);
    setAddValue('');
  });

  return (
    <ModalPanel
      show={show}
      size="sm"
      onRequestClose={handleCancel}
      title={`Edit Condition - ${criteria.Name}`}
      titleLeft
    >
      <div className="flex gap-x-4">
        <div className="grow">
          <Input
            id="year"
            type="number"
            placeholder="Year"
            value={addValue}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setAddValue(event.target.value)}
          />
        </div>
        <Button
          onClick={handleAddYear}
          buttonType="primary"
          className="px-6 py-2"
        >
          Add
        </Button>
      </div>
      <div className="flex flex-col gap-y-4">
        <div className="font-semibold">
          Selected Years
        </div>
        <div className="flex h-[15rem] grow rounded-md bg-panel-input p-4">
          <div className="flex w-full flex-col gap-y-2 overflow-y-auto">
            {map(
              combinedSelectedValues,
              year => (
                <div className="flex justify-between pr-2 leading-tight" key={year}>
                  {year}
                  <div onClick={removeValue(year)}>
                    <Icon className="cursor-pointer text-panel-icon-danger" path={mdiMinusCircleOutline} size={1} />
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
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

export default YearCriteriaModal;
