import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { filter, map, sortBy } from 'lodash';

import Button from '@/components/Input/Button';
import Select from '@/components/Input/Select';
import ModalPanel from '@/components/Panels/ModalPanel';
import { addFilterCriteria, selectActiveCriteria } from '@/core/slices/collection';
import { useFilterExpressionMain } from '@/hooks/filters';
import useEventCallback from '@/hooks/useEventCallback';

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
  const sortedCriteria = sortBy(unusedCriteria, 'Name');

  const handleClose = useEventCallback(() => {
    setNewCriteria('');
    onClose();
  });

  const handleSave = useEventCallback(() => {
    const filterExpression = filter(allCriteria, { Expression: newCriteria })[0];
    dispatch(addFilterCriteria(filterExpression));
    handleClose();
  });

  const changeCriteria = useEventCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => setNewCriteria(event.currentTarget.value),
  );

  return (
    <ModalPanel show={show} onRequestClose={onClose} title="Add Condition" titleLeft size="sm">
      <Select
        id="addCondition"
        label="Select Condition"
        value={newCriteria}
        onChange={changeCriteria}
      >
        <option value="" disabled>--Select Criteria--</option>
        {map(sortedCriteria, (item) => {
          const value = item?.Expression;
          return <option key={value} value={value}>{item.Name}</option>;
        })}
      </Select>
      <div className="flex justify-end gap-x-3 font-semibold">
        <Button onClick={handleClose} buttonType="secondary" className="px-6 py-2">Cancel</Button>
        <Button
          onClick={handleSave}
          buttonType="primary"
          className="px-6 py-2"
          disabled={!newCriteria}
        >
          Add Condition
        </Button>
      </div>
    </ModalPanel>
  );
};

export default AddCriteriaModal;
