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
      overlayClassName={cx('modal-overlay fixed inset-0 flex items-center pointer-events-auto', props.sidebarSnap ? 'justify-start ml-62.5' : 'justify-end')}
      className={`${className} bg-background-nav flex h-full w-[25rem]`}
      shouldCloseOnOverlayClick
      onRequestClose={onRequestClose}
      onAfterOpen={onAfterOpen}
    >
      {children}
    </Modal>
  );
}

export default ModalPanel;
