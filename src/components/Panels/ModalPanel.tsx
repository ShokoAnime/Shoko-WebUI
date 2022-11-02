import React from 'react';
import Modal from 'react-modal';
import cx from 'classnames';

type Props = {
  children: any;
  show: boolean;
  className?: string;
  onRequestClose?: () => void;
  onAfterOpen?: () => void;
  sidebarSnap?: boolean;
};

function ModalPanel(props: Props) {
  const {
    children, show, className, onRequestClose, onAfterOpen,
  } = props;

  Modal.setAppElement('#app-root');

  return (
    <Modal
      isOpen={show}
      overlayClassName={{
        base: cx('fixed inset-0 flex items-center pointer-events-auto', props.sidebarSnap ? 'justify-start ml-62.5 modal-transition-left' : 'justify-end modal-transition-right'),
        afterOpen: cx(props.sidebarSnap ? 'modal-transition-left--after-open' : 'modal-transition-right--after-open'),
        beforeClose: cx(props.sidebarSnap ? 'modal-transition-left--before-close' : 'modal-transition-right--before-close'),
      }}
      className={`${className} bg-background-nav flex h-full w-96`}
      shouldCloseOnOverlayClick
      onRequestClose={onRequestClose}
      onAfterOpen={onAfterOpen}
      closeTimeoutMS={300}
    >
      {children}
    </Modal>
  );
}

export default ModalPanel;
