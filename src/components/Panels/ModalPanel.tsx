import React from 'react';
import Modal from 'react-modal';
import cx from 'classnames';

type Props = {
  children: React.ReactNode;
  show: boolean;
  title?: React.ReactNode;
  titleLeft?: boolean;
  size?: 'sm' | 'md' | 'lg';
  noPadding?: boolean;
  noGap?: boolean;
  className?: string;
  onRequestClose?: () => void;
  onAfterOpen?: () => void;
};

const sizeClass = {
  sm: 'w-[32rem]',
  md: 'w-[45rem]',
  lg: 'w-[62rem]',
};

function ModalPanel(props: Props) {
  const {
    children,
    className,
    noGap,
    noPadding,
    onAfterOpen,
    onRequestClose,
    show,
    size,
    title,
    titleLeft,
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
            'flex max-h-[66%] flex-col rounded-md border border-panel-border bg-panel-background drop-shadow-lg',
            sizeClass[size ?? 'md'],
            !noPadding && ('gap-y-8'),
            className,
          )}
          onClick={e => e.stopPropagation()}
        >
          {title && (
            <div
              className={cx(
                'border-b border-panel-border bg-panel-background-alt p-8 text-xl font-semibold rounded-t-md',
                !titleLeft && ('text-center'),
              )}
            >
              {title}
            </div>
          )}
          <div className={cx('flex flex-col', !noGap && ('gap-y-8'), !noPadding && ('px-8 pb-8'))}>
            {children}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default ModalPanel;
