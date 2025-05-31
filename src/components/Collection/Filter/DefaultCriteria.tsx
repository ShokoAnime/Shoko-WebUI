import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { mdiMinusCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';

import Select from '@/components/Input/Select';
import { addFilterCondition, removeFilterCriteria } from '@/core/slices/collection';

import type { RootState } from '@/core/store';
import type { FilterExpression } from '@/core/types/api/filter';

type Props = {
  criteria: FilterExpression;
};

const Options = ({ onClick }: { onClick: () => void }) => (
  <div onClick={onClick}>
    <Icon className="cursor-pointer text-panel-icon-danger" path={mdiMinusCircleOutline} size={1} />
  </div>
);

const DefaultCriteria = ({ criteria }: Props) => {
  const dispatch = useDispatch();
  const selectedCondition = useSelector(
    (state: RootState) => {
      const value: boolean | undefined = state.collection.filterConditions[criteria.Expression];
      if (value !== undefined) {
        return value ? '1' : '0';
      }
      return value;
    },
  );

  useEffect(() => {
    if (selectedCondition === undefined) {
      dispatch(addFilterCondition({ [criteria.Expression]: true }));
    }
  }, [criteria.Expression, dispatch, selectedCondition]);

  const changeValue = (event: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(addFilterCondition({ [criteria.Expression]: event.currentTarget.value === '1' }));
  };

  const removeCriteria = () => {
    dispatch(removeFilterCriteria(criteria));
  };

  return (
    <Select
      id={criteria.Expression}
      label={criteria.Name}
      value={selectedCondition}
      onChange={changeValue}
      options={<Options onClick={removeCriteria} />}
    >
      <option value="1">True</option>
      <option value="0">False</option>
    </Select>
  );
};

export default DefaultCriteria;
