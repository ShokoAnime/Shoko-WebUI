import React, { useState } from 'react';

import Button from '@/components/Input/Button';
import InputSmall from '@/components/Input/InputSmall';
import ModalPanel from '@/components/Panels/ModalPanel';
import useEventCallback from '@/hooks/useEventCallback';

export type StringModalProps = {
  onClose: () => void;
  addValue: (value: string) => void;
  show: boolean;
  title: string;
};

function StringModal({ show, title, ...props }: StringModalProps) {
  const [addValue, setAddValue] = useState('');

  const handleClose = useEventCallback(() => {
    setAddValue('');
    props.onClose();
  });

  const handleSave = useEventCallback(() => {
    setAddValue('');
    props.addValue(addValue);
    props.onClose();
  });

  const handleTextChange = useEventCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setAddValue(value);
  });

  const handleKeyUp = useEventCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') handleSave();
  });

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
            type="text"
            autoFocus
            onChange={handleTextChange}
            onKeyUp={handleKeyUp}
            className="w-auto grow px-3 py-1"
          />
        </div>
      </div>
      <div className="flex justify-end gap-x-3 font-semibold">
        <Button onClick={handleClose} buttonType="secondary" className="px-5 py-2">
          Cancel
        </Button>
        <Button onClick={handleSave} buttonType="primary" className="px-5 py-2" disabled={addValue.trim().length === 0}>
          Save
        </Button>
      </div>
    </ModalPanel>
  );
}

export default StringModal;
