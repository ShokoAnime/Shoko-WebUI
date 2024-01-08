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

import type { FilterExpression } from '@/core/types/api/filter';

type Props = {
  criteria: FilterExpression;
  show: boolean;
  onClose: () => void;
};
const YearCriteriaModal = ({ criteria, onClose, show }: Props) => {
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

  const handleCancel = () => {
    setUnsavedValues([]);
    onClose();
  };

  const handleSave = () => {
    dispatch(setFilterValues({ [criteria.Expression]: [...selectedValues, ...unsavedValues] }));
    setUnsavedValues([]);
    onClose();
  };

  const handleAddYear = () => {
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
  };

  return (
    <ModalPanel
      show={show}
      size="sm"
      onRequestClose={onClose}
      title={`Edit Condition - ${criteria.Name}`}
      titleLeft
    >
      <div className="flex gap-x-4 overflow-y-auto">
        <Input
          id="year"
          type="text"
          placeholder="Year"
          value={addValue}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setAddValue(event.target.value)}
        />
        <Button
          onClick={handleAddYear}
          buttonType="primary"
          className="px-6 py-2"
        >
          Add
        </Button>
      </div>
      <div className="flex flex-col gap-y-4">
        <div className="flex gap-x-2">
          Selected Years
        </div>
        <div className="shoko-scrollbar h-[15rem] max-h-[15rem] grow overflow-auto bg-panel-background-alt p-4">
          <div className=" flex grow flex-col gap-x-2 bg-panel-background-alt">
            {map(
              combinedSelectedValues,
              year => (
                <div className="flex justify-between leading-tight" key={year}>
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
