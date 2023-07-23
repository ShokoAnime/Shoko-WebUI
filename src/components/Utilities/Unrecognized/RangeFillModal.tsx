import React, { useState } from 'react';

import ModalPanel from '@/components/Panels/ModalPanel';
import SelectSmall from '@/components/Input/SelectSmall';
import InputSmall from '@/components/Input/InputSmall';
import Button from '@/components/Input/Button';

type Props = {
  show: boolean;
  onClose: () => void;
  rangeFill: (rangeStart: string, epType: string) => void;
};

const RangeFillModal = ({ show, onClose, rangeFill }: Props) => {
  const [rangeStart, setRangeStart] = useState('');
  const [epType, setEpType] = useState('Normal');

  const handleFill = () => {
    rangeFill(rangeStart, epType);
    onClose();
  };

  return (
    <ModalPanel
      show={show}
      onRequestClose={onClose}
      className="p-8 flex-col drop-shadow-lg gap-y-8"
    >
      <div className="font-semibold text-xl">Range Fill Options</div>
      <div className="flex flex-col gap-y-3.5">
        <SelectSmall label="Type" id="Type" value={epType} onChange={e => setEpType(e.target.value)} className="py-">
          <option value="Normal">Episode</option>
          <option value="Special">Special</option>
          <option value="Other">Other</option>
        </SelectSmall>
        <div className="flex justify-between items-center">
          Range Starting Number
          <InputSmall id="RangeStart" type="number" value={rangeStart} onChange={e => setRangeStart(e.target.value)} className="w-16 text-center px-3 py-1" />
        </div>
      </div>
      <div className="flex justify-end gap-x-3 font-semibold">
        <Button onClick={onClose} dropShadow className="bg-button-secondary hover:bg-button-secondary-hover px-5 py-2 text-panel-text">Cancel</Button>
        <Button onClick={handleFill} dropShadow className="bg-button-primary hover:bg-button-primary-hover px-5 py-2" disabled={!rangeStart}>Fill</Button>
      </div>
    </ModalPanel>
  );
};

export default RangeFillModal;
