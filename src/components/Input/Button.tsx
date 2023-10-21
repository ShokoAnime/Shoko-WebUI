import React from 'react';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

type Props = {
  buttonType?: string;
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
    'bg-button-primary text-button-primary-text border-2 border-button-primary-border rounded-md hover:bg-button-primary-hover',
  secondary:
    'bg-button-secondary text-button-secondary-text border-2 border-button-secondary-border rounded-md hover:bg-button-secondary-hover',
  danger:
    'bg-button-danger text-button-danger-text border-2 border-button-danger-border rounded-md hover:bg-button-danger-hover',
};

function Button(props: Props) {
  const {
    buttonType,
    children,
    className,
    disabled,
    loading,
    loadingSize,
    onClick,
    submit,
    tooltip,
  } = props;

  return (
    <button
      type={submit ? 'submit' : 'button'}
      title={tooltip}
      className={cx([
        `${className} button font-semibold transition ease-in-out rounded focus:shadow-none focus:outline-none`,
        buttonType !== undefined
        && `${buttonTypeClasses[buttonType]} drop-shadow-md`,
        loading && 'cursor-default',
        disabled && 'opacity-50 cursor-default',
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
  );
}

export default Button;
