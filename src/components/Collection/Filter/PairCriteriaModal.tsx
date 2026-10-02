import type { ChangeEvent, KeyboardEvent } from 'react';
import { map } from 'lodash';

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import Select from '@/components/Input/Select';
import ModalPanel from '@/components/Panels/ModalPanel';
import { updateLeafValue } from '@/core/slices/collection';
import { useDispatch } from '@/core/store';
import {
  closePairDraft,
  displayPair,
  editPairInDraft,
  findStalePairs,
  getPairEditor,
  getPairPickerOptions,
  isSamePair,
  openPairDraft,
} from '@/core/utilities/filterTree';
import useSyncedState from '@/hooks/useSyncedState';

import type { FilterExpression, LeafNode } from '@/core/types/api/filter';
import type { PairDraft, ParameterPair } from '@/core/utilities/filterTree';

type Props = {
  catalogEntry: FilterExpression;
  node: LeafNode;
  onClose: () => void;
  onRemove: () => void;
  show: boolean;
};

const pairKey = (pair: ParameterPair) => JSON.stringify(pair);

const PairCriteriaModal = ({ catalogEntry, node, onClose, onRemove, show }: Props) => {
  const dispatch = useDispatch();
  const savedPairs = node.value.kind === 'multiPair' ? node.value.values : [];
  const editor = getPairEditor(catalogEntry);

  // Every opening starts a fresh draft from the saved pairs.
  const [draft, setDraft] = useSyncedState(show, (): PairDraft => openPairDraft(savedPairs, editor));
  const [match, setMatch] = useSyncedState(
    show,
    (): 'And' | 'Or' => (node.value.kind === 'multiPair' ? node.value.match : 'Or'),
  );

  // Captured on opening, so a stale pair removed by accident can be picked again until closing.
  const [stalePairs] = useSyncedState(show, () => findStalePairs(savedPairs, editor));
  const unusedPairs = getPairPickerOptions(editor, stalePairs, draft.pairs);
  const isStale = (pair: ParameterPair) => stalePairs.some(stale => isSamePair(stale, pair));

  const renderPair = (pair: ParameterPair) => (isStale(pair)
    ? (
      <span
        className="text-panel-text-other italic"
        data-tooltip-id="tooltip"
        data-tooltip-content="No longer offered by the server. Kept as it is when saved."
      >
        {displayPair(pair)}
        <span className="normal-case">{' (no longer offered)'}</span>
      </span>
    )
    : displayPair(pair));

  const handleMatchChange = (event: ChangeEvent<HTMLSelectElement>) => setMatch(event.target.value as 'And' | 'Or');

  const addPair = (pair: ParameterPair) => setDraft({ ...draft, pairs: [...draft.pairs, pair] });

  // Typed pairs go back into the inputs to be edited; picked ones are just removed.
  const removePair = (pair: ParameterPair) => {
    if (editor.kind === 'picker') {
      setDraft({ ...draft, pairs: draft.pairs.filter(selected => selected !== pair) });
      return;
    }
    setDraft(editPairInDraft(draft, pair));
  };

  const addTypedPair = () => {
    if (draft.first === '' || draft.second === '') return;
    setDraft({ pairs: closePairDraft(draft), first: draft.first, second: '' });
  };

  const handleSecondKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') addTypedPair();
  };

  const handleCancel = () => {
    if (savedPairs.length === 0) onRemove();
    onClose();
  };

  const handleSave = () => {
    dispatch(updateLeafValue({
      nodeId: node.id,
      value: { kind: 'multiPair', match, values: closePairDraft(draft) },
    }));
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
      {editor.kind === 'picker'
        ? (
          <div className="flex grow basis-0 overflow-y-auto rounded-lg bg-panel-input p-4">
            <div className="flex w-full flex-col gap-y-2 overflow-y-auto bg-panel-input">
              {map(
                unusedPairs,
                pair => (
                  <div onClick={() => addPair(pair)} key={pairKey(pair)} className="cursor-pointer capitalize">
                    {renderPair(pair)}
                  </div>
                ),
              )}
            </div>
          </div>
        )
        : (
          <div className="flex flex-col gap-y-3">
            {editor.firstOptions
              ? (
                <Select
                  id="pair-first"
                  label="First Value"
                  value={draft.first}
                  onChange={event => setDraft({ ...draft, first: event.target.value })}
                >
                  <option value="" disabled>--Select Value--</option>
                  {map(
                    editor.firstOptions.includes(draft.first) || draft.first === ''
                      ? editor.firstOptions
                      : [draft.first, ...editor.firstOptions],
                    option => <option key={option} value={option}>{option}</option>,
                  )}
                </Select>
              )
              : (
                <Input
                  id="pair-first"
                  label="First Value"
                  type="text"
                  value={draft.first}
                  onChange={event => setDraft({ ...draft, first: event.target.value })}
                />
              )}
            <Input
              id="pair-second"
              label="Second Value"
              type="text"
              list={editor.secondSuggestions.length > 0 ? 'pair-second-suggestions' : undefined}
              value={draft.second}
              onChange={event => setDraft({ ...draft, second: event.target.value })}
              onKeyDown={handleSecondKeyDown}
            />
            {editor.secondSuggestions.length > 0 && (
              <datalist id="pair-second-suggestions">
                {map(editor.secondSuggestions, suggestion => <option key={suggestion} value={suggestion} />)}
              </datalist>
            )}
            <div className="flex justify-end">
              <Button
                onClick={addTypedPair}
                buttonType="secondary"
                className="px-6 py-2"
                disabled={draft.first === '' || draft.second === ''}
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
            {map(
              draft.pairs,
              pair => (
                <div onClick={() => removePair(pair)} key={pairKey(pair)} className="cursor-pointer capitalize">
                  {renderPair(pair)}
                </div>
              ),
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-x-3 font-semibold">
        <Button onClick={handleCancel} buttonType="secondary" className="px-6 py-2">Cancel</Button>
        <Button onClick={handleSave} buttonType="primary" className="px-6 py-2">Save</Button>
      </div>
    </ModalPanel>
  );
};

export default PairCriteriaModal;
