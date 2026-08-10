import { useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { filter, map } from 'lodash';

import Button from '@/components/Input/Button';
import Select from '@/components/Input/Select';
import ModalPanel from '@/components/Panels/ModalPanel';
import { useFilterExpressionsQuery } from '@/core/react-query/filter/queries';
import { addLeaf, selectUsedExpressionsInGroup } from '@/core/slices/collection';
import { useDispatch, useSelector } from '@/core/store';

type Props = {
  groupId: string;
  onClose: () => void;
  show: boolean;
};

const AddCriteriaModal = ({ groupId, onClose, show }: Props) => {
  const dispatch = useDispatch();
  const allCriteria = useFilterExpressionsQuery(show).data;
  const usedKeys = useSelector(state => selectUsedExpressionsInGroup(state, groupId));
  const unusedCriteria = useMemo(() => filter(allCriteria, item => !usedKeys.includes(item.Expression)), [
    allCriteria,
    usedKeys,
  ]);
  const [newCriteria, setNewCriteria] = useState('');

  const handleClose = () => {
    setNewCriteria('');
    onClose();
  };

  const handleSave = () => {
    const filterExpression = filter(allCriteria, { Expression: newCriteria })[0];
    if (!filterExpression) return;
    dispatch(addLeaf({ entry: filterExpression, groupId }));
    handleClose();
  };

  const changeCriteria = (event: ChangeEvent<HTMLSelectElement>) => setNewCriteria(event.currentTarget.value);

  return (
    <ModalPanel show={show} onRequestClose={onClose} header="Add Condition" size="sm">
      <Select
        id="addCondition"
        label="Select Condition"
        value={newCriteria}
        onChange={changeCriteria}
      >
        <option value="" disabled>--Select Criteria--</option>
        {map(unusedCriteria, (item) => {
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
