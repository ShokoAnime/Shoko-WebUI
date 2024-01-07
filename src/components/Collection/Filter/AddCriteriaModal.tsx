import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { filter, map } from 'lodash';

import Button from '@/components/Input/Button';
import Select from '@/components/Input/Select';
import ModalPanel from '@/components/Panels/ModalPanel';
import { addFilterCriteria, selectActiveCriteria } from '@/core/slices/collection';
import { useFilterExpressionMain } from '@/hooks/filters';

type Props = {
  show: boolean;
  onClose: () => void;
};

const AddCriteriaModal = ({ onClose, show }: Props) => {
  const dispatch = useDispatch();
  const allCriteria = useFilterExpressionMain(show);
  const selectedKeys = useSelector(selectActiveCriteria);
  const unusedCriteria = useMemo(() => filter(allCriteria, item => selectedKeys.indexOf(item.Expression) === -1), [
    allCriteria,
    selectedKeys,
  ]);
  const [newCriteria, setNewCriteria] = useState('');
  const handleSave = () => {
    const filterExpression = filter(allCriteria, { Expression: newCriteria })[0];
    dispatch(addFilterCriteria(filterExpression));
    onClose();
  };

  return (
    <ModalPanel show={show} onRequestClose={onClose} title="Add Condition" titleLeft>
      <Select
        id="addCondition"
        label="Select Condition"
        value={newCriteria}
        onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
          setNewCriteria(event.currentTarget.value);
        }}
      >
        {map(unusedCriteria, (item) => {
          const value = item?.Expression;
          return <option key={value} value={value}>{item.Name}</option>;
        })}
      </Select>
      <div className="flex justify-end gap-x-3 font-semibold">
        <Button onClick={onClose} buttonType="secondary" className="px-6 py-2">Cancel</Button>
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

export default AddCriteriaModal;
