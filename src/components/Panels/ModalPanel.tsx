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
      className="flex h-full justify-center items-center"
      onAfterOpen={onAfterOpen}
      closeTimeoutMS={150}
    >
      <div className="flex justify-center items-center w-full h-full" onClick={onRequestClose}>
        <div className={`${className} bg-background w-[40rem] max-h-fit flex rounded-md border border-background-alt`} onClick={e => e.stopPropagation()}>
          {children}
        </div>
      </div>
    </Modal>
  );
}

export default ModalPanel;
