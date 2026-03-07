import React, { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import Button from '@/components/Input/Button';
import ModalPanel from '@/components/Panels/ModalPanel';
import useToggleModalKeybinds from '@/hooks/useToggleModalKeybinds';

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
  cancelText = 'Cancel',
  children,
  confirmButtonType = 'primary',
  confirmText = 'Confirm',
  onClose,
  onConfirm,
  show,
  title,
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

  useToggleModalKeybinds(show);
  useHotkeys('escape', onClose, { scopes: 'modal' });
  useHotkeys('enter', handleConfirm, { scopes: 'modal' });

  return (
    <ModalPanel
      show={show}
      onRequestClose={onClose}
      size="sm"
      header={<div className="text-xl font-semibold">{title}</div>}
    >
      <div className="flex flex-col gap-y-4 py-2">
        {children}
      </div>
      <div className="flex justify-end gap-x-3 font-semibold">
        <Button onClick={onClose} buttonType="secondary" className="px-5 py-2">
          {cancelText}
        </Button>
        <Button
          onClick={handleConfirm}
          buttonType={confirmButtonType}
          className="px-5 py-2"
          loading={isConfirmPending}
        >
          {confirmText}
        </Button>
      </div>
    </ModalPanel>
  );
};

export default ConfirmationPromptModal;
