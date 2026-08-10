import type { ChangeEvent } from 'react';
import { mdiMinusCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';

import Select from '@/components/Input/Select';
import { updateLeafValue } from '@/core/slices/collection';
import { useDispatch } from '@/core/store';

import type { FilterExpression, LeafNode } from '@/core/types/api/filter';

type Props = {
  catalogEntry: FilterExpression;
  node: LeafNode;
  onRemove: () => void;
};

const Options = ({ onClick }: { onClick: () => void }) => (
  <div onClick={onClick}>
    <Icon className="cursor-pointer text-panel-icon-danger" path={mdiMinusCircleOutline} size={1} />
  </div>
);

const DefaultCriteria = ({ catalogEntry, node, onRemove }: Props) => {
  const dispatch = useDispatch();
  const value = node.value.kind === 'boolean' ? node.value.value : true;

  const changeValue = (event: ChangeEvent<HTMLSelectElement>) => {
    dispatch(updateLeafValue({
      nodeId: node.id,
      value: { kind: 'boolean', value: event.currentTarget.value === '1' },
    }));
  };

  return (
    <Select
      id={node.id}
      label={catalogEntry.Name}
      value={value ? '1' : '0'}
      onChange={changeValue}
      options={<Options onClick={onRemove} />}
    >
      <option value="1">True</option>
      <option value="0">False</option>
    </Select>
  );
};

export default DefaultCriteria;
