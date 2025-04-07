import React, { useEffect } from 'react';

import Button from '@/components/Input/Button';
import ModalPanel from '@/components/Panels/ModalPanel';
import useEventCallback from '@/hooks/useEventCallback';

type ConfirmProps = {
  show: boolean;
  title: React.ReactNode;
  children: React.ReactNode;
  confirm?: React.ReactNode;
  cancel?: React.ReactNode;
  onClose: () => void;
  onConfirm: () => void;
};

function ConfirmModal(props: ConfirmProps): React.JSX.Element {
  const { cancel: cancelText = 'Cancel', children, confirm: confirmText = 'Confirm', onClose, onConfirm, show, title } =
    props;

  const onKeyboard = useEventCallback((event: KeyboardEvent) => {
    if (!show) return;
    event.stopPropagation();
    event.preventDefault();
    if (event.key === 'Escape') {
      onClose();
    } else if (event.key === 'Enter') {
      onConfirm();
    }
  });

  useEffect(() => {
    if (show) {
      window.addEventListener('keydown', onKeyboard);
    }
    return () => {
      if (!show) return;
      window.removeEventListener('keydown', onKeyboard);
    };
  }, [onKeyboard, show]);

  return (
    <ModalPanel
      show={show}
      size="sm"
      onRequestClose={onClose}
      shouldCloseOnEsc={false}
      header={title}
    >
      <div className="flex flex-col gap-y-2">
        {children}
      </div>
      <div className="flex justify-end gap-x-3 font-semibold">
        <Button onClick={onClose} buttonType="secondary" className="px-5 py-2">{cancelText}</Button>
        <Button onClick={onConfirm} buttonType="primary" className="px-5 py-2">{confirmText}</Button>
      </div>
    </ModalPanel>
  );
}

export default ConfirmModal;
