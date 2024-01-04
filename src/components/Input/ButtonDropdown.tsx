import React, { useState } from 'react';
import useMeasure from 'react-use-measure';
import { mdiChevronDown, mdiLoading } from '@mdi/js';
import Icon from '@mdi/react';
import cx from 'classnames';
import { useEventCallback } from 'usehooks-ts';

type Props = {
  buttonTypes?: 'primary' | 'secondary' | 'danger';
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  loadingSize?: number;
  tooltip?: string;
  text: string;
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
    disabled,
    loading,
    loadingSize,
    text,
    tooltip,
  } = props;

  const [open, setOpen] = useState(false);
  const onClick = useEventCallback(() => {
    setOpen(prev => !prev);
  });
  const [containerRef, bounds] = useMeasure();

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        title={tooltip}
        className={cx([
          `${className} button rounded font-semibold transition ease-in-out focus:shadow-none focus:outline-none min-w-full`,
          `${buttonTypeClasses[buttonTypes ?? 'secondary']} border border-panel-border`,
          loading && 'cursor-default',
          disabled && 'cursor-default opacity-50',
        ])}
        onClick={onClick}
        disabled={disabled}
      >
        {loading && (
          <div className="flex justify-center">
            <Icon path={mdiLoading} spin size={loadingSize ?? 1} />
          </div>
        )}

        {!loading && (
          <div className="flex flex-row justify-between">
            <span>{text}</span>
            <Icon path={mdiChevronDown} size={1} />
          </div>
        )}
      </button>
      <div
        className={cx([
          'flex-col fixed z-10 origin-top-right text-right overflow-hidden',
          open ? 'flex' : 'hidden',
          buttonTypes !== undefined && `${buttonTypeClasses[buttonTypes ?? 'secondary']} border border-panel-border`,
        ])}
        style={{ maxWidth: `${bounds.width}px` }}
      >
        <div className="py-1" role="none">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ButtonDropdown;
