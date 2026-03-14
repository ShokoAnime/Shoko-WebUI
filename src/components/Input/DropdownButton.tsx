import React, { useEffect, useMemo, useState } from 'react';
import useMeasure from 'react-use-measure';
import { mdiChevronDown, mdiLoading } from '@mdi/js';
import Icon from '@mdi/react';
import cx from 'classnames';

type Props = {
  buttonType?: 'primary' | 'secondary' | 'danger';
  className?: string;
  children: React.ReactNode;
  content: React.ReactNode | string;
  disabled?: boolean;
  loading?: boolean;
  loadingSize?: number;
  tooltip?: string;
};

const buttonTypeClassMap = {
  primary:
    'bg-button-primary bg-button-primary-hover text-button-primary-text border-2 !border-button-primary-border rounded-lg',
  secondary:
    'bg-button-secondary bg-button-primary-hover text-button-secondary-text border-2 !border-button-secondary-border rounded-lg',
  danger:
    'bg-button-danger bg-button-danger-hover text-button-danger-text border-2 !border-button-danger-border rounded-lg',
};

const DropdownButton = (props: Props) => {
  const {
    buttonType,
    children,
    className,
    content,
    disabled,
    loading,
    loadingSize,
    tooltip,
  } = props;

  const [open, setOpen] = useState(false);
  const onClick = () => {
    setOpen(prev => !prev);
  };
  const [containerRef, containerBounds] = useMeasure();
  const [menuRef, menuBounds] = useMeasure();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const menuShift = useMemo(() => containerBounds.x - (menuBounds.width - (containerBounds.width)), [
    containerBounds.x,
    containerBounds.width,
    menuBounds.width,
  ]);

  const isOutOfBounds = useMemo(() => containerBounds.right > windowWidth, [windowWidth, containerBounds.right]);

  useEffect(() => {
    const resizeEvent = () => {
      setOpen(_ => false);
      setWindowWidth(_ => window.innerWidth);
    };
    window.addEventListener('resize', resizeEvent);
    return () => {
      window.removeEventListener('resize', resizeEvent);
    };
  }, [className]);

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        title={tooltip}
        className={cx([
          className,
          'min-w-full rounded-sm px-4 py-3 font-semibold transition ease-in-out focus:shadow-none focus:outline-hidden',
          buttonType !== undefined && `${buttonTypeClassMap[buttonType]} border border-panel-border`,
          loading && 'cursor-default',
          disabled && 'cursor-default opacity-65',
        ])}
        onClick={onClick}
        disabled={disabled}
      >
        {loading && (
          <div className="flex items-center justify-center">
            <Icon path={mdiLoading} spin size={loadingSize ?? 1} />
          </div>
        )}

        {!loading && (
          <div className="flex flex-row items-center justify-between">
            <span>{content}</span>
            <Icon path={mdiChevronDown} size={1} />
          </div>
        )}
      </button>
      <div
        className={cx([
          'fixed z-10 w-fit origin-top-right flex-col justify-center gap-y-2 overflow-hidden p-3 text-right',
          open ? 'flex' : 'hidden',
          buttonType !== undefined && `${buttonTypeClassMap[buttonType]} border border-panel-border`,
        ])}
        style={{ left: isOutOfBounds ? `${menuShift}px` : `${containerBounds.left}px` }}
        ref={menuRef}
      >
        {children}
      </div>
    </div>
  );
};

export default DropdownButton;
