import React from 'react';
import Modal from 'react-modal';

type Props = {
  children: any;
  show: boolean;
  className?: string;
  onRequestClose?: () => void;
  onAfterOpen?: () => void;
};

class ModalPanel extends React.Component<Props> {
  render() {
    const {
      children, show, className, onRequestClose, onAfterOpen,
    } = this.props;

    Modal.setAppElement('#app-root');

    return (
      <Modal
        isOpen={show}
        overlayClassName="modal-overlay fixed inset-0 flex items-center justify-center pointer-events-auto"
        className={`${className} modal flex rounded-lg`}
        shouldCloseOnOverlayClick
        onRequestClose={onRequestClose}
        onAfterOpen={onAfterOpen}
      >
        {children}
      </Modal>
    );
  }
}

export default ModalPanel;
