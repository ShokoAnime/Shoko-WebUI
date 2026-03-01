import React, { useState } from 'react';

import Button from '@/components/Input/Button';
import ModalPanel from '@/components/Panels/ModalPanel';

import type { ButtonType } from '@/components/Input/Button.utils';

type Props = {
  content: React.ReactNode;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  show: boolean;
  title: string;
  confirmText?: string;
  confirmButtonType?: ButtonType;
};

const ConfirmationPromptModal = ({
  content,
  onClose,
  onConfirm,
  show,
  title,
  confirmText = 'Confirm',
  confirmButtonType = 'primary',
}: Props) => {
  const [isConfirmPending, setIsConfirmPending] = useState(false);

  const handleConfirm = () => {
    setIsConfirmPending(true);
    Promise.resolve(onConfirm())
      .then(() => setIsConfirmPending(false))
      .catch(console.error)
      .finally(onClose);
  };

  return (
    <ModalPanel
      show={show}
      onRequestClose={onClose}
      size="sm"
      header={<div className="text-xl font-semibold">{title}</div>}
    >
      <div className="flex flex-col gap-y-4 py-2">
        {content}
      </div>
      <div className="flex justify-end gap-x-3 font-semibold">
        <Button onClick={onClose} buttonType="secondary" className="px-6 py-2">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          buttonType={confirmButtonType}
          className="px-6 py-2"
          loading={isConfirmPending}
        >
          {confirmText}
        </Button>
      </div>
    </ModalPanel>
  );
};

export default ConfirmationPromptModal;
