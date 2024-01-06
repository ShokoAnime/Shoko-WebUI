import React, { useEffect, useMemo, useState } from 'react';
import useMeasure from 'react-use-measure';
import { mdiChevronDown, mdiLoading } from '@mdi/js';
import Icon from '@mdi/react';
import cx from 'classnames';
import { useEventCallback } from 'usehooks-ts';

type Props = {
  buttonTypes?: 'primary' | 'secondary' | 'danger';
  className?: string;
  children: React.ReactNode;
  content: React.ReactNode | string;
  disabled?: boolean;
  loading?: boolean;
  loadingSize?: number;
  tooltip?: string;
};

const buttonTypeClasses = {
  primary:
    'bg-button-primary text-button-primary-text border-2 !border-button-primary-border rounded-md hover:bg-button-primary-hover',
  secondary:
    'bg-button-secondary text-button-secondary-text border-2 !border-button-secondary-border rounded-md hover:bg-button-secondary-hover',
  danger:
    'bg-button-danger text-button-danger-text border-2 !border-button-danger-border rounded-md hover:bg-button-danger-hover',
};

const ButtonDropdown = (props: Props) => {
  const {
    buttonTypes,
    children,
    className,
    content,
    disabled,
    loading,
    loadingSize,
    tooltip,
  } = props;

  const [open, setOpen] = useState(false);
  const onClick = useEventCallback(() => {
    setOpen(prev => !prev);
  });
  const [containerRef, containerBounds] = useMeasure();
  const [menuRef, menuBounds] = useMeasure();
  const menuShift = useMemo(() => containerBounds.x - (menuBounds.width - (containerBounds.width)), [
    containerBounds.x,
    containerBounds.width,
    menuBounds.width,
  ]);

  useEffect(() => {
    window.addEventListener('resize', () => setOpen(_ => false));
    return () => {
      window.removeEventListener('resize', () => setOpen(_ => false));
    };
  }, [className]);

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        title={tooltip}
        className={cx([
          `${className} button rounded font-semibold transition ease-in-out focus:shadow-none focus:outline-none min-w-full`,
          buttonTypes !== undefined && `${buttonTypeClasses[buttonTypes ?? 'secondary']} border border-panel-border`,
          loading && 'cursor-default',
          disabled && 'cursor-default opacity-50',
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
          'flex-col fixed z-10 origin-top-right text-right overflow-hidden justify-center w-fit-content p-3 gap-y-2',
          open ? 'flex' : 'hidden',
          buttonTypes !== undefined && `${buttonTypeClasses[buttonTypes]} border border-panel-border`,
        ])}
        style={{ left: `${menuShift}px` }}
        ref={menuRef}
      >
        {children}
      </div>
    </div>
  );
};

export default ButtonDropdown;
