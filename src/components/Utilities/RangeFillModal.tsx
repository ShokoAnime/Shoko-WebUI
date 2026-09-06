import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { toInteger } from 'lodash';

import Button from '@/components/Input/Button';
import InputSmall from '@/components/Input/InputSmall';
import SelectSmall from '@/components/Input/SelectSmall';
import ModalPanel from '@/components/Panels/ModalPanel';
import useToggleModalKeybinds from '@/hooks/useToggleModalKeybinds';

import type { EpisodeTypeValues } from '@/core/types/api/episode';

type Props = {
  show: boolean;
  onClose: () => void;
  handleRangeFill: (episodeType: EpisodeTypeValues, rangeStart: number) => void;
};

const RangeFillModal = ({ handleRangeFill, onClose, show }: Props) => {
  const [rangeStart, setRangeStart] = useState('');
  const [episodeType, setEpisodeType] = useState('Episode');

  const handleFill = () => {
    if (!show || toInteger(rangeStart) <= 0) return;
    handleRangeFill(episodeType as EpisodeTypeValues, toInteger(rangeStart));
    onClose();
  };

  useToggleModalKeybinds(show, 'nested-modal');
  useHotkeys(
    'escape',
    () => {
      if (show) onClose();
    },
    { scopes: 'nested-modal' },
  );
  useHotkeys('enter', handleFill, { scopes: 'nested-modal' });

  return (
    <ModalPanel
      show={show}
      size="sm"
      onRequestClose={onClose}
      header="Range Fill Options"
    >
      <div className="flex flex-col gap-y-2">
        <SelectSmall label="Type" id="Type" value={episodeType} onChange={event => setEpisodeType(event.target.value)}>
          <option value="Episode">Episode</option>
          <option value="Special">Special</option>
          <option value="Other">Other</option>
          <option value="Credits">Credits</option>
          <option value="Trailer">Trailer</option>
        </SelectSmall>
        <div className="flex items-center justify-between">
          Range Starting Number
          <InputSmall
            id="RangeStart"
            type="number"
            value={rangeStart}
            onChange={event => setRangeStart(event.target.value)}
            onKeyUp={(event) => {
              if (event.key === 'Enter') handleFill();
            }}
            className="w-16 px-3 py-1 text-center"
            autoFocus
          />
        </div>
      </div>
      <div className="flex justify-end gap-x-3 font-semibold">
        <Button onClick={onClose} buttonType="secondary" className="px-5 py-2">Cancel</Button>
        <Button onClick={handleFill} buttonType="primary" className="px-5 py-2" disabled={toInteger(rangeStart) <= 0}>
          Fill
        </Button>
      </div>
    </ModalPanel>
  );
};

export default RangeFillModal;
