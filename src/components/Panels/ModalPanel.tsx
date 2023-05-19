import React from 'react';
import Modal from 'react-modal';

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

  // const isSm = useMediaQuery({ minWidth: 0, maxWidth: 767 });

  return (
    <Modal
      isOpen={show}
      overlayClassName="fixed inset-0 bg-black/50 z-[80]"
      className={`${className} absolute bg-background inset-0 top-20 m-auto w-[32rem] max-h-fit flex rounded-md`}
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
