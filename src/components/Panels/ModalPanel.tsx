import React from 'react';
import Modal from 'react-modal';
import cx from 'classnames';

type Props = {
  children: React.ReactNode;
  fullHeight?: boolean;
  show: boolean;
  header?: React.ReactNode;
  subHeader?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  noPadding?: boolean;
  noGap?: boolean;
  className?: string;
  onRequestClose?: () => void;
  onAfterOpen?: () => void;
  overlayClassName?: string;
};

const sizeClass = {
  sm: 'w-[37.5rem]',
  md: 'w-[50rem]',
  lg: 'w-[62rem]',
};

const ModalPanel = (props: Props) => {
  const {
    children,
    className,
    fullHeight,
    header,
    noGap,
    noPadding,
    onAfterOpen,
    onRequestClose,
    overlayClassName,
    show,
    size,
    subHeader,
  } = props;

  Modal.setAppElement('#app-root');

  // const isSm = useMediaQuery({ minWidth: 0, maxWidth: 767 });

  return (
    <Modal
      isOpen={show}
      overlayClassName={cx('fixed inset-0 bg-black/50 z-[80]', overlayClassName)}
      className="mt-20 flex h-full items-center justify-center"
      onAfterOpen={onAfterOpen}
      closeTimeoutMS={150}
    >
      <div className="flex size-full items-center justify-center" onClick={onRequestClose}>
        <div
          className={cx(
            'flex flex-col rounded-lg border border-panel-border bg-panel-background drop-shadow-lg overflow-y-auto',
            sizeClass[size ?? 'md'],
            !noPadding && ('gap-y-6'),
            fullHeight ? 'h-[75%]' : 'max-h-[75%]',
            className,
          )}
          onClick={event => event.stopPropagation()}
        >
          <div>
            {header && (
              <div className="rounded-t-lg border-b border-panel-border bg-panel-background-alt p-6 text-xl font-semibold">
                {header}
                {subHeader && <div className="mt-1 text-base">{subHeader}</div>}
              </div>
            )}
          </div>
          <div
            className={cx(
              'flex flex-col grow',
              !noGap && ('gap-y-6'),
              !noPadding && ('px-6 pb-8'),
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ModalPanel;
