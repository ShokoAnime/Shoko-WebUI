import React, { useState } from 'react';

import Button from '@/components/Input/Button';
import ModalPanel from '@/components/Panels/ModalPanel';
import useKeyboardBindings from '@/hooks/useKeyboardBindings';

import type { ButtonType } from '@/components/Input/Button.utils';

type Props = {
  children: React.ReactNode;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  show: boolean;
  title: string;
  cancelText?: string;
  confirmText?: string;
  confirmButtonType?: ButtonType;
};

const ConfirmationPromptModal = ({
  children,
  onClose,
  onConfirm,
  show,
  title,
  cancelText: cancel = 'Cancel',
  confirmText: confirm = 'Confirm',
  confirmButtonType = 'primary',
}: Props) => {
  const [isConfirmPending, setIsConfirmPending] = useState(false);

  const handleConfirm = () => {
    setIsConfirmPending(true);
    Promise.resolve()
      .then(() => onConfirm())
      .then(() => setIsConfirmPending(false))
      .catch(console.error)
      .finally(() => onClose());
  };

  useKeyboardBindings(show && !isConfirmPending, {
    Escape: onClose,
    Enter: handleConfirm,
  });

  return (
    <ModalPanel
      show={show}
      onRequestClose={onClose}
      shouldCloseOnEsc={false}
      size="sm"
      header={<div className="text-xl font-semibold">{title}</div>}
    >
      <div className="flex flex-col gap-y-4 py-2">
        {children}
      </div>
      <div className="flex justify-end gap-x-3 font-semibold">
        <Button onClick={onClose} buttonType="secondary" className="px-5 py-2" keybinding="Esc">
          {cancel}
        </Button>
        <Button
          onClick={handleConfirm}
          buttonType={confirmButtonType}
          className="px-5 py-2"
          loading={isConfirmPending}
          keybinding="Enter"
        >
          {confirm}
        </Button>
      </div>
    </ModalPanel>
  );
};

export default ConfirmationPromptModal;
