import React from 'react';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

type Props = {
  buttonType?: string;
  buttonSize?: string;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  loadingSize?: number;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  submit?: boolean;
  tooltip?: string;
};

const buttonTypeClasses = {
  primary:
    'bg-button-primary text-button-primary-text border border-button-primary-border hover:bg-button-primary-hover',
  secondary:
    'bg-button-secondary text-button-secondary-text border border-button-secondary-border hover:bg-button-secondary-hover',
  danger: 'bg-button-danger text-button-danger-text border border-button-danger-border hover:bg-button-danger-hover',
};

const buttonSizeClasses = {
  normal: 'px-4 py-2',
  small: ' px-4 py-1',
};

const Button = React.memo(
  (
    {
      buttonSize = '',
      buttonType = '',
      children,
      className,
      disabled,
      loading,
      loadingSize,
      onClick,
      submit,
      tooltip,
    }: Props,
  ) => (
    <button
      type={submit ? 'submit' : 'button'}
      title={tooltip}
      className={cx([
        `${className} button text-sm font-semibold transition ease-in-out rounded-lg outline-none`,
        buttonType && `${buttonTypeClasses[buttonType]}`,
        buttonSize && `${buttonSizeClasses[buttonSize]}`,
        loading && 'cursor-default',
        disabled && 'opacity-65 cursor-default',
      ])}
      onClick={onClick}
      disabled={disabled}
    >
      {loading
        ? (
          <div className="flex justify-center">
            <Icon path={mdiLoading} spin size={loadingSize ?? 1} />
          </div>
        )
        : children}
    </button>
  ),
);

export default Button;
