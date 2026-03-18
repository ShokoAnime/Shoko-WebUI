import React from 'react';
import Modal from 'react-modal';
import cx from 'classnames';

type Props = {
  children: React.ReactNode;
  fullHeight?: boolean;
  show: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  subHeader?: React.ReactNode;
  size: keyof typeof sizeClass;
  noPadding?: boolean;
  noGap?: boolean;
  className?: string;
  onRequestClose?: () => void;
  onAfterOpen?: () => void;
  overlayClassName?: string;
  shouldCloseOnEsc?: boolean;
};

const sizeClass = {
  sm: 'w-150',
  md: 'w-200',
  lg: 'w-250',
  xl: 'w-300',
};

const ModalPanel = (props: Props) => {
  const {
    children,
    className,
    footer,
    fullHeight,
    header,
    noGap,
    noPadding,
    onAfterOpen,
    onRequestClose,
    overlayClassName,
    shouldCloseOnEsc = false,
    show,
    size,
    subHeader,
  } = props;

  Modal.setAppElement('#app-root');

  // const isSm = useMediaQuery({ minWidth: 0, maxWidth: 767 });

  return (
    <Modal
      isOpen={show}
      overlayClassName={cx('fixed inset-0 z-80 bg-black/50', overlayClassName)}
      className="flex h-full"
      onAfterOpen={onAfterOpen}
      closeTimeoutMS={150}
      shouldCloseOnEsc={shouldCloseOnEsc}
    >
      <div className="mt-38 flex w-full items-center justify-center p-4" onClick={onRequestClose}>
        <div
          className={cx(
            'flex flex-col overflow-y-auto rounded-lg border border-panel-border bg-panel-background drop-shadow-lg',
            sizeClass[size],
            !noPadding && ('gap-y-6'),
            fullHeight ? 'h-full' : 'max-h-full',
            className,
          )}
          onClick={event => event.stopPropagation()}
        >
          {header && (
            <div className="rounded-t-lg border-b border-panel-border bg-panel-background-alt p-6 text-xl font-semibold">
              {header}
              {subHeader && <div className="mt-1 text-base">{subHeader}</div>}
            </div>
          )}
          <div
            className={cx(
              'flex grow flex-col overflow-y-auto',
              !noGap && 'gap-y-6',
              !noPadding && 'px-6',
              !noPadding && !footer && 'pb-8',
            )}
          >
            {children}
          </div>
          {footer && (
            <div className="rounded-b-lg border-t border-panel-border bg-panel-background-alt p-6">
              {footer}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ModalPanel;
