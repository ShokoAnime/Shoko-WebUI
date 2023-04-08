import React from 'react';
import Modal from 'react-modal';
import cx from 'classnames';
import { useMediaQuery } from 'react-responsive';

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

  const isSm = useMediaQuery({ minWidth: 0, maxWidth: 767 });

  return (
    <Modal
      isOpen={show}
      overlayClassName={{
        base: cx('fixed inset-0 flex items-center pointer-events-auto z-[80]', (!isSm && props.sidebarSnap) && 'justify-start ml-62.5 modal-transition-left', (!isSm && !props.sidebarSnap) && 'justify-center modal-transition-top', isSm && 'justify-start mt-15'),
        afterOpen: cx(props.sidebarSnap ? 'modal-transition-left--after-open' : 'modal-transition-right--after-open'),
        beforeClose: cx(props.sidebarSnap ? 'modal-transition-left--before-close' : 'modal-transition-right--before-close'),
      }}
      className={cx(`${className} bg-background-nav flex`, isSm ? 'w-full' : 'w-96')}
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
