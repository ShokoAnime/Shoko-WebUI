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
    children,
    className,
    onAfterOpen,
    onRequestClose,
    show,
  } = props;

  Modal.setAppElement('#app-root');

  // const isSm = useMediaQuery({ minWidth: 0, maxWidth: 767 });

  return (
    <Modal
      isOpen={show}
      overlayClassName="fixed inset-0 bg-black/50 z-[80]"
      className="flex h-full items-center justify-center"
      onAfterOpen={onAfterOpen}
      closeTimeoutMS={150}
    >
      <div className="flex h-full w-full items-center justify-center" onClick={onRequestClose}>
        <div
          className={`${className} flex max-h-fit w-[40rem] rounded-md border border-panel-border-alt bg-panel-background`}
          onClick={e => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </Modal>
  );
}

export default ModalPanel;
