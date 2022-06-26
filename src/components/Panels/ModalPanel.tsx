import React from 'react';
import Modal from 'react-modal';

type Props = {
  children: any;
  show: boolean;
  className?: string;
  onRequestClose?: () => void;
  onAfterOpen?: () => void;
};

function ModalPanel(props: Props) {
  const {
    children, show, className, onRequestClose, onAfterOpen,
  } = props;

  Modal.setAppElement('#app-root');

  return (
    <Modal
      isOpen={show}
      overlayClassName="modal-overlay fixed inset-0 flex items-center justify-end pointer-events-auto"
      className={`${className} modal flex h-full`}
      shouldCloseOnOverlayClick
      onRequestClose={onRequestClose}
      onAfterOpen={onAfterOpen}
    >
      {children}
    </Modal>
  );
}

export default ModalPanel;
