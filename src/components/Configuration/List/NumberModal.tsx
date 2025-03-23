import React, { useEffect, useState } from 'react';

import Button from '@/components/Input/Button';
import InputSmall from '@/components/Input/InputSmall';
import ModalPanel from '@/components/Panels/ModalPanel';
import useEventCallback from '@/hooks/useEventCallback';

export type NumberModalProps = {
  onClose: () => void;
  addValue: (value: number) => void;
  show: boolean;
  default: number;
  max?: number;
  min?: number;
  integer: boolean;
  title: string;
  values: number[];
};

function NumberModal({ show, title, ...props }: NumberModalProps) {
  const [addValue, setAddValue] = useState(props.default);

  const handleClose = useEventCallback(() => {
    setAddValue(0);
    props.onClose();
  });

  const handleSave = useEventCallback(() => {
    setAddValue(0);
    props.addValue(addValue);
    props.onClose();
  });

  const handleNumberChange = useEventCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setAddValue(event.target.valueAsNumber);
  });

  const handleKeyUp = useEventCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') handleSave();
  });

  useEffect(() => {
    setAddValue(props.default);
  }, [props.default]);

  return (
    <ModalPanel
      show={show}
      onRequestClose={handleClose}
      header={title}
    >
      <div>
        <h3 className="mb-2 text-sm">New Value</h3>
        <div className="flex gap-x-3">
          <InputSmall
            id="add-string-modal"
            value={addValue}
            type="number"
            autoFocus
            max={props.max}
            min={props.min}
            step={props.integer ? 1 : 0.01}
            onChange={handleNumberChange}
            onKeyUp={handleKeyUp}
            className="w-auto grow px-3 py-1"
          />
        </div>
      </div>
      <div className="flex justify-end gap-x-3 font-semibold">
        <Button onClick={handleClose} buttonType="secondary" className="px-5 py-2">
          Cancel
        </Button>
        <Button onClick={handleSave} buttonType="primary" className="px-5 py-2">
          Save
        </Button>
      </div>
    </ModalPanel>
  );
}

export default NumberModal;
