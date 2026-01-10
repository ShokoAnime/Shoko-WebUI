import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { filter, map, pull } from 'lodash';

import Button from '@/components/Input/Button';
import Select from '@/components/Input/Select';
import ModalPanel from '@/components/Panels/ModalPanel';
import { selectFilterMatch, selectFilterValues, setFilterMatch, setFilterValues } from '@/core/slices/collection';

import type { RootState } from '@/core/store';
import type { FilterExpression } from '@/core/types/api/filter';

type Props = {
  criteria: FilterExpression;
  show: boolean;
  onClose: () => void;
  removeCriteria: () => void;
};
const MultiValueCriteriaModal = ({ criteria, onClose, removeCriteria, show }: Props) => {
  const dispatch = useDispatch();
  const selectedValues = useSelector(
    (state: RootState) => selectFilterValues(state, criteria),
  );
  const [unsavedValues, setUnsavedValues] = useState([] as string[]);
  const unusedValues = useMemo(
    () => {
      // TODO: See delimiter TODO in buildFilter.ts
      const possibleValues = criteria.PossibleParameters
        ?? criteria.PossibleParameterPairs?.map(value => value.join(': '));

      return filter(
        possibleValues,
        item => !selectedValues.includes(item) && !unsavedValues.includes(item),
      );
    },
    [criteria.PossibleParameters, criteria.PossibleParameterPairs, selectedValues, unsavedValues],
  );
  const filterMatch = useSelector((state: RootState) => selectFilterMatch(state, criteria.Expression));

  const handleMatchChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setFilterMatch({ [criteria.Expression]: event.target.value as 'Or' | 'And' }));
  };

  const selectValue = (value: string) => {
    setUnsavedValues([...unsavedValues, value]);
  };

  const removeValue = (value: string) => {
    if (unsavedValues.includes(value)) {
      setUnsavedValues(pull([...unsavedValues], value));
    }
    if (selectedValues.includes(value)) {
      dispatch(setFilterValues({ [criteria.Expression]: pull([...selectedValues], value) }));
    }
  };

  const handleCancel = () => {
    setUnsavedValues([]);
    if (selectedValues.length === 0) removeCriteria();
    onClose();
  };

  const handleSave = () => {
    dispatch(setFilterValues({ [criteria.Expression]: [...selectedValues, ...unsavedValues] }));
    setUnsavedValues([]);
    onClose();
  };

  return (
    <ModalPanel
      show={show}
      size="sm"
      onRequestClose={handleCancel}
      header={`Edit Condition - ${criteria.Name}`}
      subHeader={criteria.Description}
      fullHeight
    >
      <Select id="match" onChange={handleMatchChange} value={filterMatch}>
        <option value="Or">Match Any</option>
        <option value="And">Match All</option>
      </Select>
      <div className="flex grow basis-0 overflow-y-auto rounded-lg bg-panel-input p-4">
        <div className="flex w-full flex-col gap-y-2 overflow-y-auto bg-panel-input">
          {map(unusedValues, value => (
            <div
              onClick={() => {
                selectValue(value);
              }}
              key={value}
              className="cursor-pointer capitalize"
            >
              {value}
            </div>
          ))}
        </div>
      </div>
      <div className="flex grow flex-col gap-y-4">
        <div className="font-semibold">Selected Values</div>
        <div className="flex grow basis-0 overflow-y-auto rounded-lg bg-panel-input p-4">
          <div className="flex w-full flex-col gap-y-2 overflow-y-auto bg-panel-input">
            {map([...selectedValues, ...unsavedValues], value => (
              <div
                onClick={() => {
                  removeValue(value);
                }}
                key={value}
                className="cursor-pointer capitalize"
              >
                {value}
              </div>
            ))}
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

export default MultiValueCriteriaModal;
