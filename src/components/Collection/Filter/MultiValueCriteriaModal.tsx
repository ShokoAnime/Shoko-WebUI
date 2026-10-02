import { useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { filter, map, pull } from 'lodash';

import Button from '@/components/Input/Button';
import Select from '@/components/Input/Select';
import ModalPanel from '@/components/Panels/ModalPanel';
import { updateLeafValue } from '@/core/slices/collection';
import { useDispatch } from '@/core/store';

import type { FilterExpression, LeafNode, LeafValue } from '@/core/types/api/filter';

type Props = {
  catalogEntry: FilterExpression;
  node: LeafNode;
  onClose: () => void;
  onRemove: () => void;
  show: boolean;
};

const MultiValueCriteriaModal = ({ catalogEntry, node, onClose, onRemove, show }: Props) => {
  const dispatch = useDispatch();

  const selectedValues = useMemo(() => (node.value.kind === 'multi' ? node.value.values : []), [node.value]);
  const initialMatch = node.value.kind === 'multi' ? node.value.match : 'Or';

  const [unsavedValues, setUnsavedValues] = useState<string[]>([]);
  const [match, setMatch] = useState<'And' | 'Or'>(initialMatch);

  const unusedValues = useMemo(
    () =>
      filter(
        catalogEntry.PossibleParameters,
        item => !selectedValues.includes(item) && !unsavedValues.includes(item),
      ),
    [catalogEntry.PossibleParameters, selectedValues, unsavedValues],
  );

  const toMultiValue = (values: string[]): LeafValue => ({ kind: 'multi', values, match });

  const handleMatchChange = (event: ChangeEvent<HTMLSelectElement>) => setMatch(event.target.value as 'And' | 'Or');

  const selectValue = (value: string) => {
    setUnsavedValues([...unsavedValues, value]);
  };

  const removeValue = (value: string) => {
    if (unsavedValues.includes(value)) {
      setUnsavedValues(pull([...unsavedValues], value));
    }
    if (selectedValues.includes(value)) {
      dispatch(updateLeafValue({
        nodeId: node.id,
        value: toMultiValue(pull([...selectedValues], value)),
      }));
    }
  };

  const handleCancel = () => {
    setUnsavedValues([]);
    if (selectedValues.length === 0) onRemove();
    onClose();
  };

  const handleSave = () => {
    dispatch(updateLeafValue({
      nodeId: node.id,
      value: toMultiValue([...selectedValues, ...unsavedValues]),
    }));
    setUnsavedValues([]);
    onClose();
  };

  return (
    <ModalPanel
      show={show}
      size="sm"
      onRequestClose={handleCancel}
      header={`Edit Condition - ${catalogEntry.Name}`}
      subHeader={catalogEntry.Description}
      fullHeight
    >
      <Select id="match" onChange={handleMatchChange} value={match}>
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
