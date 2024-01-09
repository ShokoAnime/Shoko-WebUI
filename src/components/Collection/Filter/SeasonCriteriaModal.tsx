import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { mdiMinusCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { findIndex, map, pull } from 'lodash';

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import Select from '@/components/Input/Select';
import ModalPanel from '@/components/Panels/ModalPanel';
import toast from '@/components/Toast';
import { selectFilterSeasons, setFilterSeason } from '@/core/slices/collection';

import type { FilterExpression, FilterSeason } from '@/core/types/api/filter';

type Props = {
  criteria: FilterExpression;
  show: boolean;
  onClose: () => void;
};
const SeasonCriteriaModal = ({ criteria, onClose, show }: Props) => {
  const dispatch = useDispatch();
  const defaultSeason = criteria.PossibleSecondParameters ? criteria.PossibleSecondParameters[0] : '';
  const [addValue, setAddValue] = useState('');
  const [addSeason, setAddSeason] = useState(defaultSeason);
  const selectedValues = useSelector(state => selectFilterSeasons(state, criteria));
  const [unsavedValues, setUnsavedValues] = useState<FilterSeason[]>([]);

  const combinedSelectedValues = useMemo(
    () => [...selectedValues, ...unsavedValues],
    [selectedValues, unsavedValues],
  );

  const removeValue = (season: FilterSeason) => () => {
    if (findIndex(unsavedValues, season) !== -1) {
      setUnsavedValues(pull([...unsavedValues], season));
    }
    if (findIndex(selectedValues, season) !== -1) {
      dispatch(setFilterSeason({ [criteria.Expression]: pull([...selectedValues], season) }));
    }
  };

  const handleCancel = () => {
    setUnsavedValues([]);
    onClose();
  };

  const handleSave = () => {
    dispatch(setFilterSeason({ [criteria.Expression]: [...selectedValues, ...unsavedValues] }));
    setUnsavedValues([]);
    onClose();
  };

  const handleAddYear = () => {
    const isYear = /^\d{4}$/.test(addValue);
    if (!isYear) {
      toast.error('Value is not a year!');
      return;
    }
    if (
      findIndex(unsavedValues, { Year: addValue, Season: addSeason }) !== -1
      || findIndex(selectedValues, { Year: addValue, Season: addSeason }) !== -1
    ) {
      return;
    }
    setUnsavedValues([...unsavedValues, { Year: addValue, Season: addSeason }]);
    setAddValue('');
    setAddSeason(defaultSeason);
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
        <div className="grow">
          <Input
            id="year"
            type="text"
            placeholder="Year"
            value={addValue}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setAddValue(event.target.value)}
          />
        </div>
        <div className="min-w-[30%] grow">
          <Select
            id="season"
            value={addSeason}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
              setAddSeason(event.currentTarget.value);
            }}
          >
            {map(criteria.PossibleSecondParameters, item => <option key={item} value={item}>{item}</option>)}
          </Select>
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
        <div className="flex gap-x-2">
          Selected Years
        </div>
        <div className="shoko-scrollbar h-[15rem] max-h-[15rem] grow overflow-auto bg-panel-background-alt p-4">
          <div className=" flex grow flex-col gap-x-2 bg-panel-background-alt">
            {map(
              combinedSelectedValues,
              season => (
                <div className="flex justify-between leading-tight" key={`${season.Season}-${season.Year}`}>
                  {`${season.Season} ${season.Year}`}
                  <div onClick={removeValue(season)}>
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

export default SeasonCriteriaModal;
