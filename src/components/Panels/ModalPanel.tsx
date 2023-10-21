import React from 'react';
import Modal from 'react-modal';
import cx from 'classnames';

type Props = {
  children: React.ReactNode;
  show: boolean;
  title: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onRequestClose?: () => void;
  onAfterOpen?: () => void;
};

const sizeClass = {
  sm: 'w-[31.25rem]',
  md: 'w-[40rem]',
  lg: 'w-[56.875rem]',
};

function ModalPanel(props: Props) {
  const {
    children,
    className,
    onAfterOpen,
    onRequestClose,
    show,
    size,
    title,
  } = props;

  Modal.setAppElement('#app-root');

  // const isSm = useMediaQuery({ minWidth: 0, maxWidth: 767 });

  return (
    <Modal
      isOpen={show}
      overlayClassName="fixed inset-0 bg-black/50 z-[80]"
      className="mt-10 flex h-full items-center justify-center"
      onAfterOpen={onAfterOpen}
      closeTimeoutMS={150}
    >
      <div className="flex h-full w-full items-center justify-center" onClick={onRequestClose}>
        <div
          className={cx(
            'flex max-h-[66%] flex-col gap-y-8 rounded-md border border-panel-border bg-panel-background p-8 drop-shadow-lg',
            sizeClass[size ?? 'md'],
            className,
          )}
          onClick={e => e.stopPropagation()}
        >
          <div className="text-xl font-semibold">{title}</div>
          <div className="flex flex-col gap-y-8">
            {children}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default ModalPanel;
