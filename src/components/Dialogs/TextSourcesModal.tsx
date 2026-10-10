import { uniqBy } from 'lodash';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import ModalPanel from '@/components/Panels/ModalPanel';
import TextSourceLabel from '@/components/Settings/TextSourceLabel';
import { getTextSourceOrder, isSameKey } from '@/core/react-query/metadata/helpers';
import useSyncedState from '@/hooks/useSyncedState';

import type { TextSourceType } from '@/core/react-query/metadata/helpers';

type Props = {
  /** What the order is for, e.g. `Series Title`, or `null` to hide the modal. */
  type: string | null;
  order: string[];
  sources: TextSourceType[];
  /** Takes the picked sources into the unsaved settings, the ones already listed kept in their place. */
  onOrderChange: (order: string[]) => void;
  onClose: () => void;
};

/** Picks the sources a title or description order uses, every source the server knows offered. */
const TextSourcesModal = ({ onClose, onOrderChange, order, sources, type }: Props) => {
  const [picked, setPicked] = useSyncedState<string[] | null, string[]>(
    type !== null ? order : null,
    source => source ?? [],
  );

  // A source in the order that no route lists is offered too, so it can be removed.
  const offered = uniqBy([...sources, ...getTextSourceOrder(order, sources)], item => item.source.toLowerCase());

  const handleChange = (source: string, checked: boolean) => {
    const rest = picked.filter(item => !isSameKey(item, source));
    setPicked(checked ? [...rest, source] : rest);
  };

  const handleSave = () => {
    onOrderChange(picked);
    onClose();
  };

  return (
    <ModalPanel
      show={type !== null}
      onRequestClose={onClose}
      header={`${type} Sources`}
      size="md"
    >
      <div className="w-full rounded-lg border border-panel-border bg-panel-input p-4">
        <div className="flex max-h-80 flex-col gap-y-1.5 overflow-y-auto rounded-lg bg-panel-input px-3 py-2">
          {offered.map(item => (
            <Checkbox
              id={`text-source-${item.source}`}
              key={item.source}
              isChecked={picked.some(source => isSameKey(source, item.source))}
              onChange={event => handleChange(item.source, event.target.checked)}
              label={<TextSourceLabel source={item} />}
              justify
            />
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-x-3 font-semibold">
        <Button onClick={onClose} buttonType="secondary" className="px-5 py-2">Discard</Button>
        <Button
          onClick={handleSave}
          buttonType="primary"
          className="px-5 py-2"
          disabled={picked.length === 0}
        >
          Save
        </Button>
      </div>
    </ModalPanel>
  );
};

export default TextSourcesModal;
