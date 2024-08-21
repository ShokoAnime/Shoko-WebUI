import React from 'react';
import type { PlacesType } from 'react-tooltip';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import { buttonSizeClasses, buttonTypeClasses } from '@/components/Input/Button.utils';

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
  tooltipPlace?: PlacesType;
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
      tooltipPlace,
    }: Props,
  ) => (
    <button
      type={submit ? 'submit' : 'button'}
      className={cx([
        `${className} button text-sm font-semibold transition ease-in-out rounded-lg outline-none`,
        buttonType && `${buttonTypeClasses[buttonType]}`,
        buttonSize && `${buttonSizeClasses[buttonSize]}`,
        loading && 'cursor-default',
        disabled && 'opacity-65 cursor-default',
      ])}
      onClick={onClick}
      disabled={disabled}
      data-tooltip-id="tooltip"
      data-tooltip-content={tooltip}
      data-tooltip-place={tooltipPlace ?? 'top'}
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
