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
  primary: 'bg-button-primary hover:bg-button-primary-hover text-button-text-alt',
  secondary: 'bg-button-secondary hover:bg-button-secondary-hover text-button-text',
  danger: 'bg-button-danger hover:bg-button-danger-hover text-button-text-alt',
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
        `${className} button font-semibold transition ease-in-out text-sm rounded focus:shadow-none focus:outline-none`,
        buttonType !== undefined
        && `${buttonTypeClasses[buttonType]} drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-panel-border`,
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
