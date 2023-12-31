import React from 'react';
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

const Options = (props: { onClick: () => void }) => (
  <div onClick={props.onClick}>
    <Icon className="cursor-pointer text-panel-icon-danger" path={mdiMinusCircleOutline} size={1} />
  </div>
);

const DefaultCriteria = ({ criteria }: Props) => {
  const dispatch = useDispatch();
  const selectedCondition = useSelector(
    (state: RootState) => {
      const value = state.collection.filterConditions[criteria.Expression] ?? true;
      return value ? '1' : '0';
    },
  );

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
