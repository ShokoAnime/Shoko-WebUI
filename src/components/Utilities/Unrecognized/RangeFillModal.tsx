import React, { useState } from 'react';

import Button from '@/components/Input/Button';
import InputSmall from '@/components/Input/InputSmall';
import SelectSmall from '@/components/Input/SelectSmall';
import ModalPanel from '@/components/Panels/ModalPanel';

type Props = {
  show: boolean;
  onClose: () => void;
  rangeFill: (rangeStart: string, epType: string) => void;
};

const RangeFillModal = ({ onClose, rangeFill, show }: Props) => {
  const [rangeStart, setRangeStart] = useState('');
  const [epType, setEpType] = useState('Normal');

  const handleFill = () => {
    rangeFill(rangeStart, epType);
    onClose();
  };

  return (
    <ModalPanel
      show={show}
      size="sm"
      onRequestClose={onClose}
      header="Range Fill Options"
    >
      <div className="flex flex-col gap-y-2">
        <SelectSmall label="Type" id="Type" value={epType} onChange={event => setEpType(event.target.value)}>
          <option value="Normal">Episode</option>
          <option value="Special">Special</option>
          <option value="Other">Other</option>
          <option value="ThemeSong">Credits</option>
          <option value="Trailer">Trailer</option>
        </SelectSmall>
        <div className="flex items-center justify-between">
          Range Starting Number
          <InputSmall
            id="RangeStart"
            type="number"
            value={rangeStart}
            onChange={event => setRangeStart(event.target.value)}
            className="w-16 px-3 py-1 text-center"
          />
        </div>
      </div>
      <div className="flex justify-end gap-x-3 font-semibold">
        <Button onClick={onClose} buttonType="secondary" className="px-5 py-2">Cancel</Button>
        <Button onClick={handleFill} buttonType="primary" className="px-5 py-2" disabled={!rangeStart}>Fill</Button>
      </div>
    </ModalPanel>
  );
};

export default RangeFillModal;
