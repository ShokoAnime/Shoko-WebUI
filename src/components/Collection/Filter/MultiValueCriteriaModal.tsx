import { useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { filter, map } from 'lodash';

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
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

// Each value is kept as its raw parameters ([first] or [first, second]) and joined into a
// single display string only for this picker's own lists and keys - never re-split, so a
// value that happens to contain ': ' can't be misinterpreted.
const displayEntry = (entry: string[]) => entry.join(': ');

type ParameterInputProps = {
  id: string;
  label: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  possibleValues?: string[];
  type?: string;
  value: string;
};

// A listed parameter is always picked from the server's list; free text is only offered
// when the server sends no list for that parameter.
const ParameterInput = ({ id, label, onChange, onSubmit, possibleValues, type, value }: ParameterInputProps) => {
  if (possibleValues) {
    return (
      <Select id={id} label={label} value={value} onChange={event => onChange(event.target.value)}>
        <option value="" disabled>{`--Select ${label}--`}</option>
        {map(possibleValues, item => <option key={item} value={item}>{item}</option>)}
      </Select>
    );
  }
  return (
    <Input
      id={id}
      label={label}
      type={type === 'Number' ? 'number' : 'text'}
      value={value}
      onChange={event => onChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') onSubmit();
      }}
    />
  );
};

const MultiValueCriteriaModal = ({ catalogEntry, node, onClose, onRemove, show }: Props) => {
  const dispatch = useDispatch();
  const isPair = node.value.kind === 'multiPair';

  const selectedEntries = useMemo(() => {
    if (node.value.kind === 'multiPair') return node.value.values;
    if (node.value.kind === 'multi') return node.value.values.map(value => [value]);
    return [];
  }, [node.value]);
  const initialMatch = node.value.kind === 'multi' || node.value.kind === 'multiPair' ? node.value.match : 'Or';

  const [unsavedEntries, setUnsavedEntries] = useState<string[][]>([]);
  const [match, setMatch] = useState<'And' | 'Or'>(initialMatch);
  const [firstValue, setFirstValue] = useState('');
  const [secondValue, setSecondValue] = useState('');

  const usedDisplayValues = useMemo(
    () => [...selectedEntries, ...unsavedEntries].map(displayEntry),
    [selectedEntries, unsavedEntries],
  );

  // The server sends either pairs or separate per-parameter lists, never both. Pairs, or a
  // single listed parameter, are picked from one list; anything else gets one input per
  // parameter.
  const possibleEntries = useMemo(
    () => (isPair ? catalogEntry.PossibleParameterPairs : catalogEntry.PossibleParameters?.map(value => [value])),
    [catalogEntry.PossibleParameterPairs, catalogEntry.PossibleParameters, isPair],
  );

  const unusedEntries = useMemo(
    () => filter(possibleEntries, entry => !usedDisplayValues.includes(displayEntry(entry))),
    [possibleEntries, usedDisplayValues],
  );

  const firstLabel = catalogEntry.ParameterName ?? 'Value';
  const secondLabel = catalogEntry.SecondParameterName ?? 'Second Value';
  let listLabel: string | undefined;
  if (isPair && (catalogEntry.ParameterName ?? catalogEntry.SecondParameterName)) {
    listLabel = displayEntry([firstLabel, secondLabel]);
  } else if (!isPair) {
    listLabel = catalogEntry.ParameterName;
  }

  const buildValue = (entries: string[][], matchValue: 'And' | 'Or'): LeafValue => {
    if (isPair) {
      return {
        kind: 'multiPair',
        match: matchValue,
        values: entries.map((entry): [string, string] => [entry[0], entry[1] ?? '']),
      };
    }
    return { kind: 'multi', values: entries.map(entry => entry[0]), match: matchValue };
  };

  const handleMatchChange = (event: ChangeEvent<HTMLSelectElement>) => setMatch(event.target.value as 'And' | 'Or');

  const selectEntry = (entry: string[]) => {
    setUnsavedEntries([...unsavedEntries, entry]);
  };

  const enteredEntry = isPair ? [firstValue.trim(), secondValue.trim()] : [firstValue.trim()];
  const canAddEntered = enteredEntry.every(value => value !== '')
    && !usedDisplayValues.includes(displayEntry(enteredEntry));

  const addEnteredEntry = () => {
    if (!canAddEntered) return;
    selectEntry(enteredEntry);
    setFirstValue('');
    setSecondValue('');
  };

  const removeEntry = (display: string) => {
    if (unsavedEntries.some(entry => displayEntry(entry) === display)) {
      setUnsavedEntries(unsavedEntries.filter(entry => displayEntry(entry) !== display));
    }
    if (selectedEntries.some(entry => displayEntry(entry) === display)) {
      dispatch(updateLeafValue({
        nodeId: node.id,
        value: buildValue(selectedEntries.filter(entry => displayEntry(entry) !== display), match),
      }));
    }
  };

  const handleCancel = () => {
    setUnsavedEntries([]);
    if (selectedEntries.length === 0) onRemove();
    onClose();
  };

  const handleSave = () => {
    dispatch(updateLeafValue({
      nodeId: node.id,
      value: buildValue([...selectedEntries, ...unsavedEntries], match),
    }));
    setUnsavedEntries([]);
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
      {possibleEntries
        ? (
          <div className="flex grow flex-col gap-y-4">
            {listLabel && <div className="font-semibold">{listLabel}</div>}
            <div className="flex grow basis-0 overflow-y-auto rounded-lg bg-panel-input p-4">
              <div className="flex w-full flex-col gap-y-2 overflow-y-auto bg-panel-input">
                {map(unusedEntries, (entry) => {
                  const display = displayEntry(entry);
                  return (
                    <div
                      onClick={() => {
                        selectEntry(entry);
                      }}
                      key={display}
                      className="cursor-pointer capitalize"
                    >
                      {display}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )
        : (
          <div className="flex flex-col gap-y-4">
            <ParameterInput
              id="parameter"
              label={firstLabel}
              onChange={setFirstValue}
              onSubmit={addEnteredEntry}
              possibleValues={catalogEntry.PossibleParameters}
              type={catalogEntry.Parameter}
              value={firstValue}
            />
            {isPair && (
              <ParameterInput
                id="secondParameter"
                label={secondLabel}
                onChange={setSecondValue}
                onSubmit={addEnteredEntry}
                possibleValues={catalogEntry.PossibleSecondParameters}
                type={catalogEntry.SecondParameter}
                value={secondValue}
              />
            )}
            <div className="flex justify-end font-semibold">
              <Button
                onClick={addEnteredEntry}
                buttonType="primary"
                className="px-6 py-2"
                disabled={!canAddEntered}
              >
                Add
              </Button>
            </div>
          </div>
        )}
      <div className="flex grow flex-col gap-y-4">
        <div className="font-semibold">Selected Values</div>
        <div className="flex grow basis-0 overflow-y-auto rounded-lg bg-panel-input p-4">
          <div className="flex w-full flex-col gap-y-2 overflow-y-auto bg-panel-input">
            {map(usedDisplayValues, value => (
              <div
                onClick={() => {
                  removeEntry(value);
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
